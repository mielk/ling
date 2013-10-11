using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.BLL.Services;
using Typer.Domain.Entities;
using Typer.Common.Helpers;
using Moq;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class UserRegistrationDataTests
    {

        private UserRegistrationData urd;
        private string username = "abcde";
        private string password = "haslo1";
        private string confirmPassword = "haslo1";
        private string email = "mail@mail.com";
        private string existingUsername = "existing_user";
        private string existingMail = "existing@mail.com";



        public UserRegistrationDataTests()
        {
            Mock<IUserService> mockService = new Mock<IUserService>();
            mockService.Setup(m => m.userExists(existingUsername)).Returns(true);
            mockService.Setup(m => m.userExists(It.IsNotIn<string>(existingUsername))).Returns(false);
            mockService.Setup(m => m.mailExists(existingMail)).Returns(true);
            mockService.Setup(m => m.mailExists(It.IsNotIn<string>(existingMail))).Returns(false);

            urd = new UserRegistrationData(mockService.Object);
            assignValidDataSet(urd);

        }




        [TestMethod]
        public void for_proper_data_set_object_is_valid()
        {
            assignValidDataSet(urd);
            Assert.IsTrue(urd.isValid());
        }


        [TestMethod]
        public void if_username_is_too_short_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Username = "a";
            Assert.IsFalse(urd.isValid());

            urd.Username = new string('a', UserRegistrationData.UserNameMinimumLength - 1);
            Assert.IsFalse(urd.isValid());

        }


        [TestMethod]
        public void if_username_is_too_long_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Username = new string('a', UserRegistrationData.UserNameMaximumLength + 1);
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_username_is_empty_or_null_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Username = "";
            Assert.IsFalse(urd.isValid());

            urd.Username = null;
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void for_existing_username_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Username = existingUsername;
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_password_is_empty_or_null_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Password = "";
            Assert.IsFalse(urd.isValid());

            urd.Password = null;
            Assert.IsFalse(urd.isValid());

        }


        [TestMethod]
        public void if_password_is_too_short_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Password = new string('a', UserRegistrationData.PasswordMinimumLength - 1);
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_password_contains_no_letter_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Password = "12345678_0";
            Assert.IsFalse(urd.isValid());
        }

        [TestMethod]
        public void if_password_contain_no_number_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Password = "abcdefghijkl_";
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_confirm_password_is_empty_or_null_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.ConfirmPassword = "";
            Assert.IsFalse(urd.isValid());

            urd.ConfirmPassword = null;
            Assert.IsFalse(urd.isValid());

        }


        [TestMethod]
        public void if_passwords_doesnt_match_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Password = "H@sl01";
            urd.ConfirmPassword = "H@sl02";
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void if_mail_is_illegal_data_are_invalid()
        {
            assignValidDataSet(urd);
            string[] illegalMails = { "mail.o2.pl", "mail@o2", "@o2.pl", "mail mail@o2.pl", "mail@o2.pl.", "mail@o2..pl" };

            foreach (string mail in illegalMails)
            {
                urd.Email = mail;
                Assert.IsFalse(urd.isValid());
            }

        }


        [TestMethod]
        public void if_mail_is_not_unique_data_are_invalid()
        {
            assignValidDataSet(urd);
            urd.Email = existingMail;
            Assert.IsFalse(urd.isValid());
        }


        [TestMethod]
        public void convertion_to_user_returns_proper_object()
        {
            assignValidDataSet(urd);
            User user = urd.toUser();

            Assert.AreEqual(username, user.Username);
            Assert.AreEqual(SHA1.Encode(password), user.Password);
            Assert.AreEqual(email, user.Email);
            Assert.IsFalse(user.MailVerified);
            Assert.IsTrue(user.IsActive);
            Assert.IsNull(user.FirstName);
            Assert.IsNull(user.LastName);
            Assert.IsNull(user.DateOfBirth);
            Assert.IsNull(user.CountryId);

            DateTime today = DateTime.Today;
            Assert.AreEqual(today.Date, user.RegistrationDate.Value.Date);

        }



        private void assignValidDataSet(UserRegistrationData urd)
        {
            urd.Username = username;
            urd.Password = password;
            urd.ConfirmPassword = confirmPassword;
            urd.Email = email;
        }


    }
}
