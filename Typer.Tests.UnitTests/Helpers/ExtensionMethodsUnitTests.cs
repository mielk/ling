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
            Assert.IsTrue(s.isNullOrEmpty());
        }


        [TestMethod]
        public void IsNullOrEmpty_returns_true_for_empty_string()
        {
            var s = string.Empty;
            Assert.IsTrue(s.isNullOrEmpty());
        }


        [TestMethod]
        public void IsNullOrEmpty_returns_false_for_non_empty_string()
        {
            var s = "a";
            Assert.IsFalse(s.isNullOrEmpty());
        }


        [TestMethod]
        public void IsLegalMail_returns_false_for_illegal_mails()
        {

            string[] illegalMails = { "mail.o2.pl", "mail@o2", "@o2.pl", "mail mail@o2.pl", "mail@o2.pl.", "mail@o2..pl" };

            foreach (var mail in illegalMails)
            {
                Assert.IsFalse(mail.isLegalMail());
            }

        }

        [TestMethod]
        public void IsLegalMail_returns_true_for_legal_mails()
        {

            string[] legalMails = { "mail@o2.pl", "mail@gmail.com", "imie.nazwisko@firma.com", " mail@o2.pl " };

            foreach (var mail in legalMails)
            {
                Assert.IsTrue(mail.isLegalMail());
            }

        }


        [TestMethod]
        public void ToRange_number_in_range_returns_the_same_number()
        {
            var number = 5;
            Assert.AreEqual(5, number.ToRange(1, 10));
        }

        [TestMethod]
        public void ToRange_lower_number_returns_low_bound()
        {
            var number = -1;
            Assert.AreEqual(1, number.ToRange(1, 10));
        }

        [TestMethod]
        public void ToRange_higher_number_returns_high_bound()
        {
            var number = 11;
            Assert.AreEqual(10, number.ToRange(1, 10));
        }



    }
}
