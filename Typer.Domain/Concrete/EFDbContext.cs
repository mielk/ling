using System.Data.Entity;
using Typer.Domain.Entities;

namespace Typer.Domain.Concrete
{
    public class EFDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
    }
}