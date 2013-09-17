using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace LoginForm.Models
{
    public class User
    {

        [Required]
        [Display(Name = "User name")]
        public string UserName { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        public string ConfirmPassword { get; set; }

        [Required]
        [Display(Name = "Email")]
        public string Email { get; set; }


        [Display(Name = "Remember on this computer")]
        public bool RememberMe { get; set; }

        /// <summary>
        /// Checks if user with given password exists in the database
        /// </summary>
        /// <param name="_username">User name</param>
        /// <param name="_password">User password</param>
        /// <returns>True if user exist and password is correct</returns>
        public bool IsAuthenticated(string _username, string _password)
        {
            using (var cn = new SqlConnection(@"Data Source=(LocalDB)\v11.0;AttachDbFilename" +
              @"='C:\USERS\TXMIELN\DOCUMENTS\VISUAL STUDIO 2012\PROJECTS\LOGINFORM\LOGINFORM\APP_DATA\DB.MDF';Integrated Security=True"))

            {
                string _sql = @"SELECT [Username] FROM [dbo].[System_Users] " +
                       @"WHERE [Username] = @u AND [Password] = @p AND [IsActive] = 1";
                var cmd = new SqlCommand(_sql, cn);
                cmd.Parameters
                    .Add(new SqlParameter("@u", SqlDbType.NVarChar))
                    .Value = _username;
                cmd.Parameters
                    .Add(new SqlParameter("@p", SqlDbType.NVarChar))
                    .Value = Helpers.SHA1.Encode(_password);
                cn.Open();
                var reader = cmd.ExecuteReader();
                if (reader.HasRows)
                {
                    reader.Dispose();
                    cmd.Dispose();
                    return true;
                }
                else
                {
                    reader.Dispose();
                    cmd.Dispose();
                    return false;
                }
            }

        }




        public bool IsValid()
        {
            if (!isUserNameValid()) return false;
            if (!arePasswordsValid()) return false;
            return true;
        }



        private bool isUserNameValid()
        {
            const int MIN_USERNAME_LENGTH = 6;
            const int MAX_USERNAME_LENGTH = 20;

            if (UserName == null ||
                UserName.Length < MIN_USERNAME_LENGTH ||
                UserName.Length > MAX_USERNAME_LENGTH ||
                LoginAlreadyExists()) return false;

            return true;

        }


        private bool arePasswordsValid()
        {

            const int MIN_PASSWORD_LENGTH = 6;
            const int MAX_PASSWORD_LENGTH = 20;

            if (Password == null || 
                ConfirmPassword == null || 
                Password != ConfirmPassword || 
                Password.Length < MIN_PASSWORD_LENGTH || 
                Password.Length > MAX_PASSWORD_LENGTH ||
                !passwordContainsLowerLetter(Password) ||
                !passwordContainsUpperLetter(Password) ||
                !passwordContainsNumeric(Password) ||
                !passwordContainsSpecialChar(Password)) return false;

            return true;

        }

        private bool passwordContainsLowerLetter(string pswd)
        {
            if (Password.ToUpper().Equals(Password)) return false;
            return true;
        }

        private bool passwordContainsUpperLetter(string pswd)
        {
            if (Password.ToLower().Equals(Password)) return false;
            return true;
        }

        private bool passwordContainsNumeric(string pswd)
        {
            int numerics = pswd.ToCharArray().Count(x => char.IsDigit(x));
            return (numerics > 0);
        }

        private bool passwordContainsSpecialChar(string pswd)
        {
            int specialChars = pswd.ToCharArray().Count(x => !char.IsLetterOrDigit(x));
            return (specialChars > 0);
        }

        public bool LoginAlreadyExists()
        {

            string _username = UserName;

            using (var cn = new SqlConnection(@"Data Source=(LocalDB)\v11.0;AttachDbFilename" +
              @"='C:\USERS\TXMIELN\DOCUMENTS\VISUAL STUDIO 2012\PROJECTS\LOGINFORM\LOGINFORM\APP_DATA\DB.MDF';Integrated Security=True"))
            {
                string _sql = @"SELECT [Username] FROM [dbo].[System_Users] WHERE [Username] = @u";
                var cmd = new SqlCommand(_sql, cn);
                cmd.Parameters
                    .Add(new SqlParameter("@u", SqlDbType.NVarChar))
                    .Value = _username;
                cn.Open();
                var reader = cmd.ExecuteReader();
                if (reader.HasRows)
                {
                    reader.Dispose();
                    cmd.Dispose();
                    return true;
                }
                else
                {
                    reader.Dispose();
                    cmd.Dispose();
                    return false;
                }
            }
        }

        public bool Add()
        {

            if (LoginAlreadyExists()) return false;

            string _username = UserName;
            string _password = Helpers.SHA1.Encode(Password);
            string _mail = Email;

            using (var cn = new SqlConnection(@"Data Source=(LocalDB)\v11.0;AttachDbFilename" +
              @"='C:\USERS\TXMIELN\DOCUMENTS\VISUAL STUDIO 2012\PROJECTS\LOGINFORM\LOGINFORM\APP_DATA\DB.MDF';Integrated Security=True"))
            {

                string _sql = @"INSERT INTO [dbo].[System_Users] (Username, Password, Email) VALUES(@u, @p, @m);";
                var cmd = new SqlCommand(_sql, cn);
                cmd.Parameters.Add(new SqlParameter("@u", SqlDbType.NVarChar)).Value = _username;
                cmd.Parameters.Add(new SqlParameter("@p", SqlDbType.NVarChar)).Value = _password;
                cmd.Parameters.Add(new SqlParameter("@m", SqlDbType.NVarChar)).Value = _mail;

                cn.Open();
                var reader = cmd.ExecuteReader();
                reader.Dispose();
                cmd.Dispose();
            }

            if (LoginAlreadyExists()) return true;

            return false;

        }

        public static bool ActiveUserExists(string _username)
        {
            return false;
        }

        public bool Remove()
        {
            return false;
        }

    }

}