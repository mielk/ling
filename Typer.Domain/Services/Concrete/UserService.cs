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

        private readonly IUsersRepository _repository;

        public UserService(IUsersRepository repository)
        {
            _repository = repository ?? RepositoryFactory.GetUsersRepository();
        }


        public User GetUser(UserLoginData loginData)
        {
            var dto = _repository.GetUser(loginData.Username, Sha1.Encode(loginData.Password));
            return UserFromDto(dto);
        }

        public User GetUserByMail(string mail)
        {
            var dto = _repository.GetUserByMail(mail);
            return UserFromDto(dto);
        }

        public User GetUserByName(string username)
        {
            var dto = _repository.GetUser(username);
            return UserFromDto(dto);
        }

        public bool IsAuthenticated(UserLoginData loginData)
        {
            return _repository.UserExists(loginData.Username, Sha1.Encode(loginData.Password));
        }

        public bool AddUser(User user)
        {
            var dto = UserToDto(user);
            return _repository.AddUser(dto);
        }

        public bool UserExists(string username)
        {
            return _repository.UserExists(username);
        }

        public bool MailExists(string mail)
        {
            return _repository.MailExists(mail);
        }

        public bool VerifyMail(int userId)
        {
            return _repository.VerifyMail(userId);
        }

        public bool ResetVerificationCode(int userId)
        {
            var code = Guid.NewGuid().ToString().Replace("-", "");
            return _repository.ResetVerificationCode(userId, code);
        }

        public bool ResetPassword(User user, string password)
        {
            return _repository.ResetPassword(user.UserID, password);
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