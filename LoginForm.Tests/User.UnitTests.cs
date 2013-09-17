using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using LoginForm.Models;

namespace LoginForm.Tests
{
    [TestClass]
    public class UserUnitTests
    {

        private User user;

        public UserUnitTests()
        {
            user = new User();
            populateWithCorrectParameters();
        }


        private void populateWithCorrectParameters()
        {
            user.UserName = "username";
            user.Password = "H@slo1";
            user.ConfirmPassword = "H@slo1";
            user.Email = "mail@mail.pl";
        }

        private void changeBothPasswords(string pswd)
        {
            user.Password = pswd;
            user.ConfirmPassword = pswd;
        }


        [TestMethod]
        public void IsValid_given_correct_parameters_returns_true()
        {
            populateWithCorrectParameters();
            Assert.AreEqual(true, user.IsValid());
        }

        [TestMethod]
        public void IsValid_different_passwords_returns_false()
        {

            user.Password = "H@slo1";
            user.ConfirmPassword = "H@slo2";

            Assert.AreEqual(false, user.IsValid());

        }

        [TestMethod]
        public void IsValid_too_short_username_returns_false() {
            populateWithCorrectParameters();
            user.UserName = "user";
            Assert.AreEqual(false, user.IsValid());
            user.UserName = null;
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_null_username_returns_false()
        {
            populateWithCorrectParameters();
            user.UserName = null;
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_too_long_username_returns_false()
        {
            populateWithCorrectParameters();
            user.UserName = "too_long_username_qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_null_password_returns_false()
        {
            populateWithCorrectParameters();
            changeBothPasswords(null);
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_too_short_password_returns_false()
        {
            populateWithCorrectParameters();
            changeBothPasswords("H@s1");
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_too_long_password_returns_false()
        {
            populateWithCorrectParameters();
            changeBothPasswords("H@slo111111111111111111111111111111111111111111111111111111111111111");
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_password_without_upper_letter_returns_false()
        {
            populateWithCorrectParameters();
            changeBothPasswords("h@slo1");
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_password_without_low_letter_returns_false()
        {
            populateWithCorrectParameters();
            changeBothPasswords("H@SLO1");
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_password_contains_no_number_returns_false()
        {
            populateWithCorrectParameters();
            changeBothPasswords("H@slo_");
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_password_contains_no_special_char_returns_false()
        {
            populateWithCorrectParameters();
            changeBothPasswords("Haslo1");
            Assert.AreEqual(false, user.IsValid());
        }

        [TestMethod]
        public void IsValid_given_already_existing_login_returns_false()
        {
            user.UserName = "test_user";
            if (!user.LoginAlreadyExists())
            {
                user.Add();
            }

            Assert.AreEqual(false, user.IsValid());

        }

        [TestMethod]
        public void Add_after_adding_user_exists()
        {

            int i = 1;
            user.UserName = "username_" + i;

            while (user.LoginAlreadyExists())
                user.UserName = "username_" + ++i;
            
            user.Add();

            Assert.AreEqual(true, user.LoginAlreadyExists());

        }

        [TestMethod]
        public void Remove__after_removing_user_is_not_active()
        {

        }

    }
}