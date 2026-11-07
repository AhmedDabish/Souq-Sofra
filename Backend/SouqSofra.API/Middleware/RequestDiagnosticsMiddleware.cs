using System.Diagnostics;

namespace SouqSofra.API.Middleware;

/// <summary>Records API request duration, HTTP result, trace id, and unhandled exception details.</summary>
public sealed class RequestDiagnosticsMiddleware(RequestDelegate next, ILogger<RequestDiagnosticsMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, RequestDiagnosticsLogWriter logWriter)
    {
        var startedAtUtc = DateTime.UtcNow;
        var timer = Stopwatch.StartNew();
        Exception? failure = null;

        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            failure = exception;
            throw;
        }
        finally
        {
            timer.Stop();
            var entry = new RequestDiagnosticEntry(
                startedAtUtc,
                context.TraceIdentifier,
                context.Request.Method,
                context.Request.Path.Value ?? "/",
                failure is null ? context.Response.StatusCode : StatusCodes.Status500InternalServerError,
                Math.Round(timer.Elapsed.TotalMilliseconds, 2),
                failure?.GetType().FullName,
                failure?.Message,
                failure?.StackTrace,
                "http");

            logWriter.Enqueue(entry);
            if (failure is not null)
                logger.LogError(failure, "Unhandled API request failure. TraceId: {TraceId}; {Method} {Path}; DurationMs: {DurationMs}", entry.TraceId, entry.Method, entry.Path, entry.DurationMs);
            else if (entry.StatusCode >= StatusCodes.Status500InternalServerError)
                logger.LogError("API request returned {StatusCode}. TraceId: {TraceId}; {Method} {Path}; DurationMs: {DurationMs}", entry.StatusCode, entry.TraceId, entry.Method, entry.Path, entry.DurationMs);
            else if (entry.StatusCode >= StatusCodes.Status400BadRequest)
                logger.LogWarning("API request returned {StatusCode}. TraceId: {TraceId}; {Method} {Path}; DurationMs: {DurationMs}", entry.StatusCode, entry.TraceId, entry.Method, entry.Path, entry.DurationMs);
            else if (entry.DurationMs >= 1000)
                logger.LogWarning("Slow API request. TraceId: {TraceId}; {Method} {Path}; StatusCode: {StatusCode}; DurationMs: {DurationMs}", entry.TraceId, entry.Method, entry.Path, entry.StatusCode, entry.DurationMs);
        }
    }
}
