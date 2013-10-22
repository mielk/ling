using System;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public class EFUsersRepository : IUsersRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();




        public UserDto getUser(int userID)
        {
            return context.Users.Single(u => u.UserID == userID);
        }

        public UserDto getUser(string username)
        {
            return context.Users.SingleOrDefault(u => u.Username == username);
        }

        public UserDto getUser(string username, string password)
        {
            return context.Users.SingleOrDefault(u => u.Username == username && u.Password == password && u.IsActive == true);
        }

        public UserDto getUserByMail(string mail)
        {
            return context.Users.SingleOrDefault(u => u.Email == mail);
        }




        public bool userExists(string username)
        {
            int count = context.Users.Count(u => u.Username == username);
            return (count > 0);
        }

        public bool userExists(string username, string password)
        {
            int count = context.Users.Count(u => u.Username == username && u.Password == password);
            return (count > 0);
        }

        public bool mailExists(string mail)
        {
            int records = context.Users.Count(u => u.Email == mail);
            return (records > 0 ? true : false);
        }

        public bool addUser(UserDto user)
        {
            try
            {
                context.Users.Add(user);
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }


        public bool verifyMail(int userId)
        {
            try
            {
                UserDto user = getUser(userId);
                user.MailVerified = true;
                user.VerificationDate = DateTime.Now;
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

        public bool resetVerificationCode(int userId, string code)
        {
            try
            {
                UserDto user = getUser(userId);
                user.MailVerified = false;
                user.VerificationDate = null;
                user.VerificationCode = code;
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

        public bool resetPassword(int userId, string password)
        {
            try
            {
                UserDto user = getUser(userId);
                user.Password = password;
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

    }
}