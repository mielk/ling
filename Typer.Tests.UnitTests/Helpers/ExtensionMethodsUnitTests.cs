using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.Common.Helpers;

namespace Typer.Tests.UnitTests.Helpers
{
    [TestClass]
    public class ExtensionMethodsUnitTests
    {

        [TestMethod]
        public void IsNullOrEmpty_returns_true_for_null_string()
        {
            String s = null;
            Assert.IsTrue(s.IsNullOrEmpty());
        }


        [TestMethod]
        public void IsNullOrEmpty_returns_true_for_empty_string()
        {
            var s = string.Empty;
            Assert.IsTrue(s.IsNullOrEmpty());
        }


        [TestMethod]
        public void IsNullOrEmpty_returns_false_for_non_empty_string()
        {
            const string s = "a";
            Assert.IsFalse(s.IsNullOrEmpty());
        }


        [TestMethod]
        [Ignore]
        public void CompareEnd_returns_0_if_strings_have_another_last_character()
        {
            const string _base = "asasdfd";
            Assert.AreEqual(0, _base.CompareEnd("sdfswe"));
        }

        [TestMethod]
        [Ignore]
        public void CompareEnd_returns_1_if_strings_have_the_same_last_character_only()
        {
            const string _base = "asasdfde";
            Assert.AreEqual(1, _base.CompareEnd("sdfswe"));
        }


        [TestMethod]
        [Ignore]
        public void CompareEnd_returns_5_if_strings_have_the_same_last_five_characters()
        {
            const string _base = "asasdfdeaaaa";
            Assert.AreEqual(5, _base.CompareEnd("sdfsweaaaa"));
        }


        [TestMethod]
        public void IsLegalMail_returns_false_for_illegal_mails()
        {

            string[] illegalMails = { "mail.o2.pl", "mail@o2", "@o2.pl", "mail mail@o2.pl", "mail@o2.pl.", "mail@o2..pl" };

            foreach (var mail in illegalMails)
            {
                Assert.IsFalse(mail.IsLegalMail());
            }

        }

        [TestMethod]
        public void IsLegalMail_returns_true_for_legal_mails()
        {

            string[] legalMails = { "mail@o2.pl", "mail@gmail.com", "imie.nazwisko@firma.com", " mail@o2.pl " };

            foreach (var mail in legalMails)
            {
                Assert.IsTrue(mail.IsLegalMail());
            }

        }


        [TestMethod]
        public void ToRange_number_in_range_returns_the_same_number()
        {
            const int number = 5;
            Assert.AreEqual(5, number.ToRange(1, 10));
        }

        [TestMethod]
        public void ToRange_lower_number_returns_low_bound()
        {
            const int number = -1;
            Assert.AreEqual(1, number.ToRange(1, 10));
        }

        [TestMethod]
        public void ToRange_higher_number_returns_high_bound()
        {
            const int number = 11;
            Assert.AreEqual(10, number.ToRange(1, 10));
        }
    }
}
