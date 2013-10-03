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
            String s = string.Empty;
            Assert.IsTrue(s.isNullOrEmpty());
        }


        [TestMethod]
        public void IsNullOrEmpty_returns_false_for_non_empty_string()
        {
            String s = "a";
            Assert.IsFalse(s.isNullOrEmpty());
        }


        [TestMethod]
        public void IsLegalMail_returns_false_for_illegal_mails()
        {

            string[] illegalMails = { "mail.o2.pl", "mail@o2", "@o2.pl", "mail mail@o2.pl", "mail@o2.pl.", "mail@o2..pl" };

            foreach (string mail in illegalMails)
            {
                Assert.IsFalse(mail.isLegalMail());
            }

        }

        [TestMethod]
        public void IsLegalMail_returns_true_for_legal_mails()
        {

            string[] legalMails = { "mail@o2.pl", "mail@gmail.com", "imie.nazwisko@firma.com", " mail@o2.pl " };

            foreach (string mail in legalMails)
            {
                Assert.IsTrue(mail.isLegalMail());
            }

        }


    }
}
