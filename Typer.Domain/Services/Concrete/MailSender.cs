using System;
using System.Net.Mail;

namespace Typer.Domain.Services
{
    public class MailSender : IMailSender
    {

        private SmtpClient mailer = new SmtpClient();
        private string defaultSender = "mail@mail.pl";
        
        public bool Send(string from, string to, string subject, string body){
            var message = new MailMessage(from, to);
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;
            try
            {
                mailer.Send(message);
                return true;
            } 
            catch (Exception exception){
                return false;
            }

        }


        public bool Send(string to, string subject, string body)
        {
            return Send(defaultSender, to, subject, body);
        }


    }
}
