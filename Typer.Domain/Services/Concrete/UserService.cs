using Typer.DAL.Repositories;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;
using Typer.Common.Helpers;
using Typer.Domain.Entities;
using System;

namespace Typer.Domain.Services
{

    public class UserService : IUserService
    {

        private readonly IUsersRepository repository;

        public UserService(IUsersRepository repository)
        {
            if (repository == null)
            {
                this.repository = RepositoryFactory.GetUsersRepository();
            }
            else
            {
                this.repository = repository;
            }
        }



        public User getUser(UserLoginData loginData)
        {
            var dto = repository.getUser(loginData.Username, SHA1.Encode(loginData.Password));
            return userFromDto(dto);
        }

        public User getUserByMail(string mail)
        {
            var dto = repository.getUserByMail(mail);
            return userFromDto(dto);
        }

        public User getUserByName(string username)
        {
            var dto = repository.getUser(username);
            return userFromDto(dto);
        }

        public bool IsAuthenticated(UserLoginData loginData)
        {
            return repository.userExists(loginData.Username, SHA1.Encode(loginData.Password));
        }

        public bool addUser(User user)
        {
            var dto = userToDto(user);
            return repository.addUser(dto);
        }

        public bool userExists(string username)
        {
            return repository.userExists(username);
        }

        public bool mailExists(string mail)
        {
            return repository.mailExists(mail);
        }

        public bool verifyMail(int userId)
        {
            return repository.verifyMail(userId);
        }

        public bool resetVerificationCode(int userId)
        {
            var code = Guid.NewGuid().ToString().Replace("-", "");
            return repository.resetVerificationCode(userId, code);
        }

        public bool resetPassword(User user, string password)
        {
            return repository.resetPassword(user.UserID, password);
        }



        private User userFromDto(UserDto userDto)
        {
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

        private UserDto userToDto(User user)
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