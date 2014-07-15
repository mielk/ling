using Typer.DAL.Repositories;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;
using Typer.Common.Helpers;
using Typer.Domain.Entities;
using System;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{

    public class UserService : IUserService
    {

        private readonly IUsersRepository repository;

        public UserService(IUsersRepository repository)
        {
            this.repository = repository ?? RepositoryFactory.GetUsersRepository();
        }


        public User GetUser(UserLoginData loginData)
        {
            var dto = repository.GetUser(loginData.Username, Sha1.Encode(loginData.Password));
            return UserFromDto(dto);
        }

        public User GetUserByMail(string mail)
        {
            var dto = repository.GetUserByMail(mail);
            return UserFromDto(dto);
        }

        public User GetUserByName(string username)
        {
            var dto = repository.GetUser(username);
            return UserFromDto(dto);
        }

        public bool IsAuthenticated(UserLoginData loginData)
        {
            return repository.UserExists(loginData.Username, Sha1.Encode(loginData.Password));
        }

        public bool AddUser(User user)
        {
            var dto = UserToDto(user);
            return repository.AddUser(dto);
        }

        public bool UserExists(string username)
        {
            return repository.UserExists(username);
        }

        public bool MailExists(string mail)
        {
            return repository.MailExists(mail);
        }

        public bool VerifyMail(int userId)
        {
            return repository.VerifyMail(userId);
        }

        public bool ResetVerificationCode(int userId)
        {
            var code = Guid.NewGuid().ToString().Replace("-", "");
            return repository.ResetVerificationCode(userId, code);
        }

        public bool ResetPassword(User user, string password)
        {
            return repository.ResetPassword(user.UserID, password);
        }



        private static User UserFromDto(UserDto userDto)
        {
            if (userDto == null) return null;
            return new User
            {
                CountryId = userDto.CountryId,
                DateOfBirth = userDto.DateOfBirth,
                Email = userDto.Email,
                FirstName = userDto.FirstName,
                IsActive = userDto.IsActive,
                LastName = userDto.LastName,
                MailVerified = userDto.MailVerified,
                Password = userDto.Password,
                RegistrationDate = userDto.RegistrationDate,
                UserID = userDto.UserID,
                Username = userDto.Username,
                VerificationCode = userDto.VerificationCode,
                VerificationDate = userDto.VerificationDate
            };
        }

        private static UserDto UserToDto(User user)
        {
            return new UserDto
            {
                CountryId = user.CountryId,
                DateOfBirth = user.DateOfBirth,
                Email = user.Email,
                FirstName = user.FirstName,
                IsActive = user.IsActive,
                LastName = user.LastName,
                MailVerified = user.MailVerified,
                Password = user.Password,
                RegistrationDate = user.RegistrationDate,
                UserID = user.UserID,
                Username = user.Username,
                VerificationCode = user.VerificationCode,
                VerificationDate = user.VerificationDate
            };
        }


    }

}