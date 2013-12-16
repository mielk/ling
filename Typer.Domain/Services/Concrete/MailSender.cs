using System;
using System.Net.Mail;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class MailSender : IMailSender
    {

        private readonly SmtpClient _mailer = new SmtpClient();
        private const string DefaultSender = "mail@mail.pl";

        public bool Send(string from, string to, string subject, string body){
            var message = new MailMessage(from, to) {Subject = subject, Body = body, IsBodyHtml = true};
            try
            {
                _mailer.Send(message);
                return true;
            } 
            catch (Exception){
                return false;
            }

        }


        public bool Send(string to, string subject, string body)
        {
            return Send(DefaultSender, to, subject, body);
        }


    }
}
