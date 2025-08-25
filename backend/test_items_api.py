"""
Test script for MongoDB Items API
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/items"

def test_create_item():
    """Test creating a new item"""
    print("🔧 Testing CREATE item...")
    item_data = {
        "name": "Test Widget",
        "quantity": 50,
        "price": 19.99
    }
    
    response = requests.post(BASE_URL, json=item_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 201:
        item = response.json()
        print(f"✅ Item created successfully: {json.dumps(item, indent=2)}")
        return item["id"]
    else:
        print(f"❌ Failed to create item: {response.text}")
        return None

def test_get_all_items():
    """Test getting all items"""
    print("\n📋 Testing GET all items...")
    response = requests.get(BASE_URL)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        items = response.json()
        print(f"✅ Retrieved {len(items)} items:")
        for item in items:
            print(f"  - {item['name']}: {item['quantity']} units @ ${item['price']}")
        return items
    else:
        print(f"❌ Failed to get items: {response.text}")
        return []

def test_get_item_by_id(item_id):
    """Test getting item by ID"""
    if not item_id:
        print("\n⚠️ Skipping GET by ID test - no item ID available")
        return
    
    print(f"\n🔍 Testing GET item by ID: {item_id}")
    response = requests.get(f"{BASE_URL}/{item_id}")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        item = response.json()
        print(f"✅ Item found: {json.dumps(item, indent=2)}")
    else:
        print(f"❌ Failed to get item: {response.text}")

def test_update_item(item_id):
    """Test updating an item"""
    if not item_id:
        print("\n⚠️ Skipping UPDATE test - no item ID available")
        return
    
    print(f"\n✏️ Testing UPDATE item: {item_id}")
    update_data = {
        "quantity": 75,
        "price": 24.99
    }
    
    response = requests.put(f"{BASE_URL}/{item_id}", json=update_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        item = response.json()
        print(f"✅ Item updated successfully: {json.dumps(item, indent=2)}")
    else:
        print(f"❌ Failed to update item: {response.text}")

def test_delete_item(item_id):
    """Test deleting an item"""
    if not item_id:
        print("\n⚠️ Skipping DELETE test - no item ID available")
        return
    
    print(f"\n🗑️ Testing DELETE item: {item_id}")
    response = requests.delete(f"{BASE_URL}/{item_id}")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Item deleted successfully: {result['message']}")
    else:
        print(f"❌ Failed to delete item: {response.text}")

def main():
    """Run all tests"""
    print("🚀 Starting MongoDB Items API Tests\n")
    
    try:
        # Test creating an item
        item_id = test_create_item()
        
        # Test getting all items
        test_get_all_items()
        
        # Test getting item by ID
        test_get_item_by_id(item_id)
        
        # Test updating item
        test_update_item(item_id)
        
        # Test getting item by ID again to see changes
        test_get_item_by_id(item_id)
        
        # Test deleting item
        test_delete_item(item_id)
        
        # Test getting all items after deletion
        print("\n📋 Final check - all items after deletion:")
        test_get_all_items()
        
        print("\n🎉 All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - make sure the server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error running tests: {e}")

if __name__ == "__main__":
    main()
