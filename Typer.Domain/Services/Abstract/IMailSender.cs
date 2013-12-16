// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public interface IMailSender
    {
        bool Send(string from, string to, string subject, string body);
        bool Send(string to, string subject, string body);
    }
}
