from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import crud
import schemas
from auth_handler import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = schemas.UserCreate(
            username="admin",
            email="admin@stockhub.com",
            password="admin123",
            role="admin",
            first_name="Admin",
            last_name="User",
            phone="+1234567890",
            address="123 Admin Street, Admin City"
        )
        
        try:
            admin = crud.create_user(db, admin_user)
            print(f"Created admin user: {admin.username}")
        except:
            print("Admin user already exists")
        
        # Create employee user
        employee_user = schemas.UserCreate(
            username="employee1",
            email="employee1@stockhub.com",
            password="emp123",
            role="employee",
            first_name="John",
            last_name="Employee",
            phone="+1234567891",
            address="456 Employee Street, Employee City"
        )
        
        try:
            employee = crud.create_user(db, employee_user)
            print(f"Created employee user: {employee.username}")
        except:
            print("Employee user already exists")
        
        # Create customer user
        customer_user = schemas.UserCreate(
            username="customer1",
            email="customer1@stockhub.com",
            password="cust123",
            role="customer",
            first_name="Jane",
            last_name="Customer",
            phone="+1234567892",
            address="789 Customer Street, Customer City"
        )
        
        try:
            customer = crud.create_user(db, customer_user)
            print(f"Created customer user: {customer.username}")
        except:
            print("Customer user already exists")
        
        # Create branches
        branches_data = [
            {
                "name": "New York Branch",
                "location": "New York, NY",
                "description": "Main warehouse facility in New York",
                "image_url": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500",
                "capacity": 1000,
                "available_space": 750,
                "manager_id": 2
            },
            {
                "name": "Los Angeles Branch",
                "location": "Los Angeles, CA",
                "description": "West coast distribution center",
                "image_url": "https://images.unsplash.com/photo-1590725175835-bd11c9cd7a6b?w=500",
                "capacity": 1200,
                "available_space": 900,
                "manager_id": 2
            },
            {
                "name": "Chicago Branch",
                "location": "Chicago, IL",
                "description": "Midwest logistics hub",
                "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
                "capacity": 800,
                "available_space": 600,
                "manager_id": 2
            }
        ]
        
        for branch_data in branches_data:
            try:
                branch = crud.create_branch(db, schemas.BranchCreate(**branch_data))
                print(f"Created branch: {branch.name}")
            except:
                print(f"Branch {branch_data['name']} already exists")
        
        # Create sample goods
        goods_data = [
            {
                "name": "MacBook Pro",
                "description": "High-performance laptop for professionals",
                "category": "Electronics",
                "quantity": 50,
                "price_per_unit": 1999.99,
                "branch_id": 1
            },
            {
                "name": "iPhone 15",
                "description": "Latest smartphone with advanced features",
                "category": "Electronics",
                "quantity": 100,
                "price_per_unit": 999.99,
                "branch_id": 1
            },
            {
                "name": "Office Chair",
                "description": "Ergonomic office chair for comfort",
                "category": "Furniture",
                "quantity": 25,
                "price_per_unit": 299.99,
                "branch_id": 2
            },
            {
                "name": "Standing Desk",
                "description": "Adjustable height standing desk",
                "category": "Furniture",
                "quantity": 15,
                "price_per_unit": 499.99,
                "branch_id": 2
            }
        ]
        
        for good_data in goods_data:
            try:
                good = crud.create_goods(db, schemas.GoodsCreate(**good_data), owner_id=3)
                print(f"Created good: {good.name}")
            except:
                print(f"Good {good_data['name']} already exists")
        
        # Create sample assignments
        assignments_data = [
            {
                "employee_id": 2,
                "task": "Inventory Check",
                "description": "Perform weekly inventory check for electronics section",
                "priority": "high",
                "branch_id": 1
            },
            {
                "employee_id": 2,
                "task": "Stock Replenishment",
                "description": "Replenish low stock items in furniture section",
                "priority": "medium",
                "branch_id": 2
            }
        ]
        
        for assignment_data in assignments_data:
            try:
                assignment = crud.create_assignment(db, schemas.AssignmentCreate(**assignment_data))
                print(f"Created assignment: {assignment.task}")
            except:
                print(f"Assignment {assignment_data['task']} already exists")
        
        print("Seed data creation completed!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
