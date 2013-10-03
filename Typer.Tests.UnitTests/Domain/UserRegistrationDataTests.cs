using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.BLL.Services;
using Typer.Domain.Entities;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class UserRegistrationDataTests
    {

        private string username = "username";
        private string password = "haslo1";
        private string confirmPassword = "haslo1";
        private string email = "mail@mail.com";


        [TestMethod]
        public void for_proper_data_set_object_is_valid()
        {
            UserRegistrationData urd = getValidDataSet();
            Assert.IsTrue(urd.isValid());
        }


        [TestMethod]
        public void if_username_is_too_short_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.UserName = new string('a', UserRegistrationData.UserNameMinimumLength - 1);
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_username_is_too_long_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.UserName = new string('a', UserRegistrationData.UserNameMaximumLength + 1);
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_username_is_empty_or_null_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.UserName = "";
            Assert.IsFalse(urd.isValid());

            urd.UserName = null;
            Assert.IsFalse(urd.isValid());

        }


        [TestMethod]
        public void if_password_is_empty_or_null_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.Password = "";
            Assert.IsFalse(urd.isValid());

            urd.Password = null;
            Assert.IsFalse(urd.isValid());

        }


        [TestMethod]
        public void if_password_is_too_short_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.Password = new string('a', UserRegistrationData.PasswordMinimumLength - 1);
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_password_contains_no_letter_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.Password = "12345678_0";
            Assert.IsFalse(urd.isValid());
        }

        [TestMethod]
        public void if_password_contain_no_number_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.Password = "abcdefghijkl_";
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_confirm_password_is_empty_or_null_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.ConfirmPassword = "";
            Assert.IsFalse(urd.isValid());

            urd.ConfirmPassword = null;
            Assert.IsFalse(urd.isValid());

        }


        [TestMethod]
        public void if_passwords_doesnt_match_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            urd.Password = "H@sl01";
            urd.ConfirmPassword = "H@sl02";
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_mail_is_illegal_data_are_invalid()
        {
            UserRegistrationData urd = getValidDataSet();
            string[] illegalMails = { "mail.o2.pl", "mail@o2", "@o2.pl", "mail mail@o2.pl", "mail@o2.pl.", "mail@o2..pl" };

            foreach (string mail in illegalMails)
            {
                urd.Email = mail;
                Assert.IsFalse(urd.isValid());
            }

        }



        private UserRegistrationData getValidDataSet()
        {
            return new UserRegistrationData { UserName = username, Password = password, ConfirmPassword = confirmPassword, Email = email };
        }


    }
}
