﻿using Typer.Domain.Entities;

namespace Typer.BLL.Services
{
    public interface IUserService
    {
        User getUser(UserLoginData loginData);
        User getUserByMail(string mail);
        bool IsAuthenticated(UserLoginData loginData);
        bool addUser(UserRegistrationData userData);
        bool userExists(string username);
        bool mailExists(string mail);
    }
}
