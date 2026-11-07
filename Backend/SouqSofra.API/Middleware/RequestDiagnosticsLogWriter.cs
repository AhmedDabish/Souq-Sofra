using System.Text.Json;
using System.Threading.Channels;

namespace SouqSofra.API.Middleware;

public sealed record RequestDiagnosticEntry(
    DateTime TimestampUtc,
    string TraceId,
    string Method,
    string Path,
    int StatusCode,
    double DurationMs,
    string? ExceptionType,
    string? ExceptionMessage,
    string? StackTrace,
    string EventType = "http",
    string? CommandText = null);

/// <summary>Writes one structured JSON line per API request to a daily rolling file.</summary>
public sealed class RequestDiagnosticsLogWriter : BackgroundService
{
    private readonly Channel<RequestDiagnosticEntry> _entries = Channel.CreateBounded<RequestDiagnosticEntry>(
        new BoundedChannelOptions(10_000) { FullMode = BoundedChannelFullMode.DropWrite, SingleReader = true, SingleWriter = false });
    private readonly string _directory;
    private readonly int _retentionDays;
    private readonly ILogger<RequestDiagnosticsLogWriter> _logger;

    public RequestDiagnosticsLogWriter(IConfiguration configuration, IHostEnvironment environment, ILogger<RequestDiagnosticsLogWriter> logger)
    {
        var configuredDirectory = configuration["Diagnostics:LogDirectory"];
        _directory = Path.GetFullPath(string.IsNullOrWhiteSpace(configuredDirectory) ? Path.Combine(environment.ContentRootPath, "Logs") : configuredDirectory);
        _retentionDays = Math.Clamp(configuration.GetValue("Diagnostics:RetentionDays", 30), 1, 365);
        _logger = logger;
    }

    public void Enqueue(RequestDiagnosticEntry entry)
    {
        if (!_entries.Writer.TryWrite(entry))
            _logger.LogWarning("API diagnostics queue is full; a request log entry could not be queued. TraceId: {TraceId}", entry.TraceId);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        StreamWriter? writer = null;
        string? activeDate = null;
        try
        {
            await foreach (var entry in _entries.Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    var date = entry.TimestampUtc.ToString("yyyy-MM-dd");
                    if (writer is null || activeDate != date)
                    {
                        if (writer is not null) await writer.DisposeAsync();
                        Directory.CreateDirectory(_directory);
                        var stream = new FileStream(Path.Combine(_directory, $"api-{date}.jsonl"), FileMode.Append, FileAccess.Write, FileShare.Read, 16_384, useAsync: true);
                        writer = new StreamWriter(stream);
                        activeDate = date;
                        RemoveExpiredFiles(DateTime.UtcNow.Date.AddDays(-_retentionDays));
                    }
                    await writer.WriteLineAsync(JsonSerializer.Serialize(entry).AsMemory(), stoppingToken);
                    await writer.FlushAsync(stoppingToken);
                }
                catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
                {
                    _logger.LogError(ex, "Could not write API diagnostics log to {LogDirectory}", _directory);
                }
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
        finally
        {
            if (writer is not null) await writer.DisposeAsync();
        }
    }

    private void RemoveExpiredFiles(DateTime cutoffUtc)
    {
        foreach (var file in Directory.EnumerateFiles(_directory, "api-*.jsonl"))
        {
            try
            {
                if (File.GetLastWriteTimeUtc(file) < cutoffUtc) File.Delete(file);
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                _logger.LogWarning(ex, "Could not remove expired API diagnostics file {FileName}", Path.GetFileName(file));
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _entries.Writer.TryComplete();
        await base.StopAsync(cancellationToken);
    }
}
