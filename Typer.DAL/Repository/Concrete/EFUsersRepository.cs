using System;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public class EFUsersRepository : IUsersRepository
    {

        private static readonly EFDbContext Context = EFDbContext.GetInstance();




        public UserDto GetUser(int userID)
        {
            return Context.Users.Single(u => u.UserID == userID);
        }

        public UserDto GetUser(string username)
        {
            return Context.Users.SingleOrDefault(u => u.Username == username);
        }

        public UserDto GetUser(string username, string password)
        {
            return Context.Users.SingleOrDefault(u => u.Username == username && u.Password == password && u.IsActive);
        }

        public UserDto GetUserByMail(string mail)
        {
            return Context.Users.SingleOrDefault(u => u.Email == mail);
        }




        public bool UserExists(string username)
        {
            var count = Context.Users.Count(u => u.Username == username);
            return (count > 0);
        }

        public bool UserExists(string username, string password)
        {
            var count = Context.Users.Count(u => u.Username == username && u.Password == password);
            return (count > 0);
        }

        public bool MailExists(string mail)
        {
            var records = Context.Users.Count(u => u.Email == mail);
            return (records > 0);
        }

        public bool AddUser(UserDto user)
        {
            try
            {
                Context.Users.Add(user);
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }


        public bool VerifyMail(int userId)
        {
            try
            {
                var user = GetUser(userId);
                user.MailVerified = true;
                user.VerificationDate = DateTime.Now;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool ResetVerificationCode(int userId, string code)
        {
            try
            {
                var user = GetUser(userId);
                user.MailVerified = false;
                user.VerificationDate = null;
                user.VerificationCode = code;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool ResetPassword(int userId, string password)
        {
            try
            {
                var user = GetUser(userId);
                user.Password = password;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

    }
}