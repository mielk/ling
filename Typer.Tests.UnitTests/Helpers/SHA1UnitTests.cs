using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.Common.Helpers;

namespace Typer.Tests.UnitTests
{
    [TestClass]
    public class SHA1UnitTests
    {


        [TestMethod]
        public void empty_input_returns_proper_SHA1()
        {
            Assert.IsTrue(compare("", "da39a3ee5e6b4b0d3255bfef95601890afd80709"));
        }

        [TestMethod]
        public void one_character_input_returns_proper_SHA1()
        {
            Assert.IsTrue(compare("a", "86f7e437faa5a7fce15d1ddcb9eaeaea377667b8"));
        }

        [TestMethod]
        public void numeric_input_returns_proper_SHA1()
        {
            Assert.IsTrue(compare("12345", "8cb2237d0679ca88db6464eac60da96345513964"));
        }

        [TestMethod]
        public void special_chars_input_returns_proper_SHA1()
        {
            Assert.IsTrue(compare("!@#$%", "630458f5671d4f281199f0990b054b0ebbc6722e"));
        }

        [TestMethod]
        public void for_given_input_always_returns_the_same_SHA1()
        {

            int tests = 10;
            string text = "s&gH1F_y7*kE@9pL%zQW1p";
            string expected = "e3ecd756028cb197fd4b13a70ef42eddc0a39180";

            for (int i = 0; i < tests; i++){
                Assert.IsTrue(compare(text, expected));
            }

        }


        private bool compare(string input, string expectedOutput)
        {
            string encrypted = SHA1.Encode(input);
            return (encrypted.Equals(expectedOutput));
        }

    }
}
