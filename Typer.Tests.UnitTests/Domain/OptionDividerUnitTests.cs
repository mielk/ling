using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.Domain.Entities;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class OptionDividerUnitTests
    {
        [TestMethod]
        public void if_no_options_single_variant_is_returned()
        {
            var variants = new OptionsDivider("abc").GetVariants();
            Assert.AreEqual(1, variants.Count);
            Assert.AreEqual("abc", variants[0]);
        }

        [TestMethod]
        public void if_single_option_two_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(d)ef").GetVariants();
            Assert.AreEqual(2, variants.Count);
            Assert.IsTrue(variants.Contains("abcdef"));
            Assert.IsTrue(variants.Contains("abcef"));
        }

        [TestMethod]
        public void if_double_option_two_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(d/e)fg").GetVariants();
            Assert.AreEqual(2, variants.Count);
            Assert.IsTrue(variants.Contains("abcdfg"));
            Assert.IsTrue(variants.Contains("abcefg"));
        }

        [TestMethod]
        public void if_triple_option_three_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(d/e/f)g").GetVariants();
            Assert.AreEqual(3, variants.Count);
            Assert.IsTrue(variants.Contains("abcdg"));
            Assert.IsTrue(variants.Contains("abceg"));
            Assert.IsTrue(variants.Contains("abcfg"));
        }

        [TestMethod]
        public void if_two_single_options_four_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(d)e(f)").GetVariants();
            Assert.AreEqual(4, variants.Count);
            Assert.IsTrue(variants.Contains("abcdef"));
            Assert.IsTrue(variants.Contains("abcef"));
            Assert.IsTrue(variants.Contains("abcde"));
            Assert.IsTrue(variants.Contains("abce"));
        }

        [TestMethod]
        public void if_two_double_options_four_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(d/e)f(g/h)").GetVariants();
            Assert.AreEqual(4, variants.Count);
            Assert.IsTrue(variants.Contains("abcdfg"));
            Assert.IsTrue(variants.Contains("abcdfh"));
            Assert.IsTrue(variants.Contains("abcefg"));
            Assert.IsTrue(variants.Contains("abcefh"));
        }

        [TestMethod]
        public void if_two_triple_options_nine_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(d/e/f)g(h/i/j)").GetVariants();
            Assert.AreEqual(9, variants.Count);
            Assert.IsTrue(variants.Contains("abcdgh"));
            Assert.IsTrue(variants.Contains("abcdgi"));
            Assert.IsTrue(variants.Contains("abcdgj"));
            Assert.IsTrue(variants.Contains("abcegh"));
            Assert.IsTrue(variants.Contains("abcegi"));
            Assert.IsTrue(variants.Contains("abcegj"));
            Assert.IsTrue(variants.Contains("abcfgh"));
            Assert.IsTrue(variants.Contains("abcfgi"));
            Assert.IsTrue(variants.Contains("abcfgj"));
        }

        [TestMethod]
        public void if_single_and_triple_options_six_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(d)g(h/i/j)").GetVariants();
            Assert.AreEqual(6, variants.Count);
            Assert.IsTrue(variants.Contains("abcdgh"));
            Assert.IsTrue(variants.Contains("abcdgi"));
            Assert.IsTrue(variants.Contains("abcdgj"));
            Assert.IsTrue(variants.Contains("abcgh"));
            Assert.IsTrue(variants.Contains("abcgi"));
            Assert.IsTrue(variants.Contains("abcgj"));
        }

        [TestMethod]
        public void if_single_option_nested_in_other_single_option_three_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(de(f))").GetVariants();
            Assert.AreEqual(3, variants.Count);
            Assert.IsTrue(variants.Contains("abc"));
            Assert.IsTrue(variants.Contains("abcde"));
            Assert.IsTrue(variants.Contains("abcdef"));
        }

        [TestMethod]
        public void if_double_option_nested_in_other_single_option_three_variants_are_returned()
        {
            var variants = new OptionsDivider("abc(de(f/g))").GetVariants();
            Assert.AreEqual(3, variants.Count);
            Assert.IsTrue(variants.Contains("abc"));
            Assert.IsTrue(variants.Contains("abcdeg"));
            Assert.IsTrue(variants.Contains("abcdef"));
        }

    }
}
