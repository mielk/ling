using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.Domain.Helpers;

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


    }
}
