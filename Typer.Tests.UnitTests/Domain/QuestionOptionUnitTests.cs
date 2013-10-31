using System;
using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.Domain.Entities;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class QuestionOptionUnitTests
    {
        [TestMethod]
        public void if_no_options_single_variant_is_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(1, variants.Count);
            Assert.AreEqual("abc", variants[0]);
        }

        [TestMethod]
        public void if_single_option_two_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(d)" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(2, variants.Count);
        }

        [TestMethod]
        public void if_double_option_two_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(d/e)" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(2, variants.Count);
        }

        [TestMethod]
        public void if_triple_option_three_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(d/e/f)" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(3, variants.Count);
        }

        [TestMethod]
        public void if_two_single_options_four_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(d)e(f)" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(4, variants.Count);
        }

        [TestMethod]
        public void if_two_double_options_four_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(d/e)f(g/h)" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(4, variants.Count);
        }

        [TestMethod]
        public void if_two_triple_options_nine_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(d/e/f)g(h/i/j)" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(9, variants.Count);
        }

        [TestMethod]
        public void if_single_and_triple_options_six_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(d)g(h/i/j)" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(6, variants.Count);
        }

        [TestMethod]
        public void if_single_option_nested_in_other_single_option_three_variants_are_returned()
        {
            QuestionOption option = new QuestionOption() { Content = "abc(de(f))" };
            List<string> variants = option.getAllVariants();
            Assert.AreEqual(3, variants.Count);
        }

    }
}