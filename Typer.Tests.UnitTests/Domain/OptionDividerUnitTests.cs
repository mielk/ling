using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.Domain.Entities;
using System.Collections.Generic;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class OptionDividerUnitTests
    {
        [TestMethod]
        public void if_no_options_single_variant_is_returned()
        {
            List<string> variants = OptionsDivider.instance("abc").getVariants();
            Assert.AreEqual(1, variants.Count);
            Assert.AreEqual("abc", variants[0]);
        }

        [TestMethod]
        public void if_single_option_two_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(d)ef").getVariants();
            Assert.AreEqual(2, variants.Count);
        }

        [TestMethod]
        public void if_double_option_two_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(d/e)fg").getVariants();
            Assert.AreEqual(2, variants.Count);
        }

        [TestMethod]
        public void if_triple_option_three_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(d)ef").getVariants();
            Assert.AreEqual(3, variants.Count);
        }

        [TestMethod]
        public void if_two_single_options_four_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(d)e(f)").getVariants();
            Assert.AreEqual(4, variants.Count);
        }

        [TestMethod]
        public void if_two_double_options_four_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(d/e)f(g/h)").getVariants();
            Assert.AreEqual(4, variants.Count);
        }

        [TestMethod]
        public void if_two_triple_options_nine_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(d/e/f)g(h/i/j)").getVariants();
            Assert.AreEqual(9, variants.Count);
        }

        [TestMethod]
        public void if_single_and_triple_options_six_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(d)g(h/i/j)").getVariants();
            Assert.AreEqual(6, variants.Count);
        }

        [TestMethod]
        public void if_single_option_nested_in_other_single_option_three_variants_are_returned()
        {
            List<string> variants = OptionsDivider.instance("abc(de(f))").getVariants();
            Assert.AreEqual(3, variants.Count);
        }

    }
}
