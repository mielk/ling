using System.Web.Http.Dependencies;
using Ninject;


// ReSharper disable once CheckNamespace
namespace Typer.Web
{
   // This class is the resolver, but it is also the global scope
   // so we derive from NinjectScope.
   public class NinjectDependencyResolver : NinjectDependencyScope, IDependencyResolver
   {
      private readonly IKernel _kernel;

      public NinjectDependencyResolver(IKernel kernel) : base(kernel)
      {
         _kernel = kernel;
      }

      public IDependencyScope BeginScope()
      {
         return new NinjectDependencyScope(_kernel.BeginBlock());
      }
   }
}