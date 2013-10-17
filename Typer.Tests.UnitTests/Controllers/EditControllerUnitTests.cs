using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Typer.Domain.Entities;
using Typer.DAL.Repositories;
using Typer.Web.Controllers;
using System.Collections.Generic;
using System.Linq;
using Typer.Web.HtmlHelpers;
using System.Web.Mvc;
using Typer.Web.Models;
using System;
using Typer.BLL.Services;

namespace Typer.Tests.UnitTests.Controllers
{
    [TestClass]
    public class EditControllerUnitTests
    {
        [TestMethod]
        public void Can_Paginate()
        {
            Mock<IQuestionService> mock = new Mock<IQuestionService>();
            mock.Setup(m => m.getQuestions()).Returns(new Question[] {
                new Question { Name = "test1", Weight = 1 },
                new Question { Name = "test2", Weight = 2 },
                new Question { Name = "test3", Weight = 3 },
                new Question { Name = "test4", Weight = 4 },
                new Question { Name = "test5", Weight = 5 }
            }.AsQueryable());
            EditController controller = new EditController(mock.Object);
            controller.PageSize = 3;

            QuestionsListViewModel result = (QuestionsListViewModel)controller.List(2).Model;

            // Assert
            Question[] prodArray = result.Questions.ToArray();
            Assert.IsTrue(prodArray.Length == 2);
            Assert.AreEqual(prodArray[0].Name, "test4");
            Assert.AreEqual(prodArray[1].Name, "test5");

        }




        [TestMethod]
        public void Can_Generate_Page_Links() {

            // Arrange - define an HTML helper - we need to do this
            // in order to apply the extension method
            HtmlHelper myHelper = null;

            // Arrange - create PagingInfo data
            PagingInfo pagingInfo = new PagingInfo {
                CurrentPage = 2,
                TotalItems = 28,
                ItemsPerPage = 10
            };

            // Arrange - set up the delegate using a lambda expression
            Func<int, string> pageUrlDelegate = i => "Page" + i;

            // Act
            MvcHtmlString result = myHelper.PageLinks(pagingInfo, pageUrlDelegate);

            // Assert
            Assert.AreEqual(result.ToString(), @"<a href=""Page1"">1</a>"
                + @"<a class=""selected"" href=""Page2"">2</a>"
                + @"<a href=""Page3"">3</a>");

        }


        [TestMethod]
        public void Can_Send_Pagination_View_Model()
        {
            // Arrange
            Mock<IQuestionService> mock = new Mock<IQuestionService>();
            mock.Setup(m => m.getQuestions()).Returns(new Question[] {
                new Question { Name = "test1", Weight = 1 },
                new Question { Name = "test2", Weight = 2 },
                new Question { Name = "test3", Weight = 3 },
                new Question { Name = "test4", Weight = 4 },
                new Question { Name = "test5", Weight = 5 }
            }.AsQueryable());

            // Arrange
            EditController controller = new EditController(mock.Object);
            controller.PageSize = 3;
            
            // Act
            QuestionsListViewModel result = (QuestionsListViewModel)controller.List(2).Model;
            
            // Assert
            PagingInfo pageInfo = result.PagingInfo;
            Assert.AreEqual(pageInfo.CurrentPage, 2);
            Assert.AreEqual(pageInfo.ItemsPerPage, 3);
            Assert.AreEqual(pageInfo.TotalItems, 5);
            Assert.AreEqual(pageInfo.TotalPages, 2);

        }



    }
}