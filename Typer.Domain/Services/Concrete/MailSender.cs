using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Services
{
    public class MailSender : IMailSender
    {

        private SmtpClient mailer = new SmtpClient();
        private string defaultSender = "mail@mail.pl";
        
        public bool Send(string from, string to, string subject, string body){
            MailMessage message = new MailMessage(from, to);
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
