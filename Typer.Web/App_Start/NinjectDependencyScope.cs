using System;
using System.Web.Http.Dependencies;
using Ninject;
using Ninject.Syntax;


namespace Typer.Web
{

    // Provides a Ninject implementation of IDependencyScope
    // which resolves services using the Ninject container.
    public class NinjectDependencyScope : IDependencyScope
    {

        private IResolutionRoot resolver;

        public NinjectDependencyScope(IResolutionRoot resolver)
        {
            this.resolver = resolver;
        }

        public object GetService(Type serviceType)
        {
            if (resolver == null)
            {
                throw new ObjectDisposedException("this", "This scope has been disposed");
            }

            return resolver.TryGet(serviceType);
        }

        public System.Collections.Generic.IEnumerable<object> GetServices(Type serviceType)
        {
            if (resolver == null)
                throw new ObjectDisposedException("this", "This scope has been disposed");

            return resolver.GetAll(serviceType);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            IDisposable disposable = resolver as IDisposable;
            if (disposable != null)
            {
                disposable.Dispose();
            }

            resolver = null;
        }

    }

}