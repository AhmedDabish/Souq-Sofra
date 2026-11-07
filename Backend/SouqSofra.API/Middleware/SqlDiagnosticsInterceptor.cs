using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using System.Data.Common;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace SouqSofra.API.Middleware;

/// <summary>Records failed and slow SQL commands without recording parameter values.</summary>
public sealed class SqlDiagnosticsInterceptor(
    RequestDiagnosticsLogWriter writer,
    IHttpContextAccessor httpContextAccessor,
    ILogger<SqlDiagnosticsInterceptor> logger) : DbCommandInterceptor
{
    private static readonly TimeSpan SlowCommandThreshold = TimeSpan.FromMilliseconds(500);
    private readonly ConcurrentDictionary<Guid, Stopwatch> _timers = new();

    private void Start(Guid commandId) => _timers[commandId] = Stopwatch.StartNew();

    private void Record(DbCommand command, Guid commandId, Exception? exception = null)
    {
        if (!_timers.TryRemove(commandId, out var timer)) return;
        timer.Stop();
        if (exception is null && timer.Elapsed < SlowCommandThreshold) return;

        var traceId = httpContextAccessor.HttpContext?.TraceIdentifier ?? Activity.Current?.TraceId.ToString() ?? commandId.ToString("N");
        var commandText = command.CommandText.Length > 4000 ? command.CommandText[..4000] : command.CommandText;
        commandText = Regex.Replace(commandText, @"'(?:''|[^'])*'", "'<redacted>'");
        var entry = new RequestDiagnosticEntry(
            DateTime.UtcNow,
            traceId,
            "SQL",
            "database",
            exception is null ? 0 : 500,
            Math.Round(timer.Elapsed.TotalMilliseconds, 2),
            exception?.GetType().FullName,
            exception?.Message,
            exception?.StackTrace,
            "database",
            commandText);
        writer.Enqueue(entry);
        if (exception is not null)
            logger.LogError(exception, "SQL command failed. TraceId: {TraceId}; DurationMs: {DurationMs}", traceId, entry.DurationMs);
        else
            logger.LogWarning("Slow SQL command. TraceId: {TraceId}; DurationMs: {DurationMs}", traceId, entry.DurationMs);
    }

    public override InterceptionResult<DbDataReader> ReaderExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result) { Start(eventData.CommandId); return result; }
    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default) { Start(eventData.CommandId); return new(result); }
    public override DbDataReader ReaderExecuted(DbCommand command, CommandExecutedEventData eventData, DbDataReader result) { Record(command, eventData.CommandId); return result; }
    public override ValueTask<DbDataReader> ReaderExecutedAsync(DbCommand command, CommandExecutedEventData eventData, DbDataReader result, CancellationToken cancellationToken = default) { Record(command, eventData.CommandId); return new(result); }

    public override InterceptionResult<int> NonQueryExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<int> result) { Start(eventData.CommandId); return result; }
    public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(DbCommand command, CommandEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default) { Start(eventData.CommandId); return new(result); }
    public override int NonQueryExecuted(DbCommand command, CommandExecutedEventData eventData, int result) { Record(command, eventData.CommandId); return result; }
    public override ValueTask<int> NonQueryExecutedAsync(DbCommand command, CommandExecutedEventData eventData, int result, CancellationToken cancellationToken = default) { Record(command, eventData.CommandId); return new(result); }

    public override InterceptionResult<object> ScalarExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<object> result) { Start(eventData.CommandId); return result; }
    public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(DbCommand command, CommandEventData eventData, InterceptionResult<object> result, CancellationToken cancellationToken = default) { Start(eventData.CommandId); return new(result); }
    public override object? ScalarExecuted(DbCommand command, CommandExecutedEventData eventData, object? result) { Record(command, eventData.CommandId); return result; }
    public override ValueTask<object?> ScalarExecutedAsync(DbCommand command, CommandExecutedEventData eventData, object? result, CancellationToken cancellationToken = default) { Record(command, eventData.CommandId); return new(result); }

    public override void CommandFailed(DbCommand command, CommandErrorEventData eventData) => Record(command, eventData.CommandId, eventData.Exception);
    public override Task CommandFailedAsync(DbCommand command, CommandErrorEventData eventData, CancellationToken cancellationToken = default) { Record(command, eventData.CommandId, eventData.Exception); return Task.CompletedTask; }
}
