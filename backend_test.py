#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class EnergicaStoreAPITester:
    def __init__(self, base_url="https://energica-store.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, params=data)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        print("\n=== TESTING ADMIN AUTHENTICATION ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@energicasolutions.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_auth_me(self):
        """Test auth/me endpoint"""
        success, response = self.run_test(
            "Get Current Admin",
            "GET",
            "auth/me",
            200
        )
        return success and response.get('role') == 'admin'

    def test_categories(self):
        """Test categories endpoint"""
        print("\n=== TESTING CATEGORIES ===")
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success:
            categories = response
            print(f"   Found {len(categories)} categories")
            expected_categories = ["Solar Panel", "Inverter", "Hybrid Inverter", "Battery"]
            for cat in expected_categories:
                found = any(c['name'] == cat for c in categories)
                if found:
                    print(f"   ✅ Found category: {cat}")
                else:
                    print(f"   ❌ Missing category: {cat}")
            return len(categories) >= 10  # Should have 14 categories
        return False

    def test_products_list(self):
        """Test products listing"""
        print("\n=== TESTING PRODUCTS ===")
        success, response = self.run_test(
            "Get Products",
            "GET",
            "products",
            200
        )
        if success:
            products = response.get('products', [])
            total = response.get('total', 0)
            print(f"   Found {len(products)} products (total: {total})")
            if products:
                product = products[0]
                required_fields = ['id', 'name', 'category', 'price', 'in_stock']
                for field in required_fields:
                    if field in product:
                        print(f"   ✅ Product has {field}: {product[field]}")
                    else:
                        print(f"   ❌ Product missing {field}")
            return len(products) > 0 and total > 50  # Should have 100+ products
        return False

    def test_products_category_filter(self):
        """Test category filtering"""
        success, response = self.run_test(
            "Filter Products by Category",
            "GET",
            "products",
            200,
            data={"category": "Solar Panel"}
        )
        if success:
            products = response.get('products', [])
            print(f"   Found {len(products)} Solar Panel products")
            if products:
                all_solar = all(p['category'] == 'Solar Panel' for p in products)
                print(f"   ✅ All products are Solar Panel: {all_solar}")
                return all_solar
        return False

    def test_products_search(self):
        """Test search functionality"""
        success, response = self.run_test(
            "Search Products",
            "GET",
            "products",
            200,
            data={"search": "Solar Panel"}
        )
        if success:
            products = response.get('products', [])
            print(f"   Found {len(products)} products matching 'Solar Panel'")
            return len(products) > 0
        return False

    def test_products_sort(self):
        """Test sorting functionality"""
        success, response = self.run_test(
            "Sort Products by Price",
            "GET",
            "products",
            200,
            data={"sort": "price_asc", "limit": 5}
        )
        if success:
            products = response.get('products', [])
            if len(products) >= 2:
                prices = [p['price'] for p in products]
                is_sorted = all(prices[i] <= prices[i+1] for i in range(len(prices)-1))
                print(f"   ✅ Prices sorted ascending: {is_sorted}")
                print(f"   Prices: {prices}")
                return is_sorted
        return False

    def test_product_detail(self):
        """Test individual product detail"""
        # First get a product ID
        success, response = self.run_test(
            "Get Products for Detail Test",
            "GET",
            "products",
            200,
            data={"limit": 1}
        )
        if success and response.get('products'):
            product_id = response['products'][0]['id']
            success, product = self.run_test(
                "Get Product Detail",
                "GET",
                f"products/{product_id}",
                200
            )
            if success:
                required_fields = ['id', 'name', 'category', 'price', 'description', 'features', 'applications']
                for field in required_fields:
                    if field in product:
                        print(f"   ✅ Product detail has {field}")
                    else:
                        print(f"   ❌ Product detail missing {field}")
                return 'similar_products' in product
        return False

    def test_rfq_creation(self):
        """Test RFQ creation"""
        print("\n=== TESTING RFQ ===")
        # First get a product for RFQ
        success, response = self.run_test(
            "Get Product for RFQ",
            "GET",
            "products",
            200,
            data={"limit": 1}
        )
        if success and response.get('products'):
            product = response['products'][0]
            rfq_data = {
                "items": [{
                    "product_id": product['id'],
                    "name": product['name'],
                    "price": product['price'],
                    "quantity": 2,
                    "uom": product['uom']
                }],
                "transit_mode": "Ex-Works",
                "customer_name": "Test Customer",
                "customer_phone": "9876543210",
                "customer_email": "test@example.com"
            }
            
            success, rfq = self.run_test(
                "Create RFQ",
                "POST",
                "rfq",
                200,
                data=rfq_data
            )
            if success:
                required_fields = ['id', 'status', 'total_amount', 'created_at']
                for field in required_fields:
                    if field in rfq:
                        print(f"   ✅ RFQ has {field}: {rfq[field]}")
                    else:
                        print(f"   ❌ RFQ missing {field}")
                return 'id' in rfq
        return False

    def test_admin_rfq_list(self):
        """Test admin RFQ listing"""
        success, response = self.run_test(
            "Get RFQs (Admin)",
            "GET",
            "rfq",
            200
        )
        if success:
            rfqs = response.get('rfqs', [])
            total = response.get('total', 0)
            print(f"   Found {len(rfqs)} RFQs (total: {total})")
            return True
        return False

    def test_admin_product_update(self):
        """Test admin product update"""
        print("\n=== TESTING ADMIN PRODUCT MANAGEMENT ===")
        # Get a product to update
        success, response = self.run_test(
            "Get Product for Update",
            "GET",
            "products",
            200,
            data={"limit": 1}
        )
        if success and response.get('products'):
            product = response['products'][0]
            product_id = product['id']
            original_price = product['price']
            new_price = original_price + 100
            
            success, updated = self.run_test(
                "Update Product Price",
                "PUT",
                f"products/{product_id}",
                200,
                data={"price": new_price}
            )
            if success:
                print(f"   ✅ Price updated from {original_price} to {updated.get('price')}")
                return updated.get('price') == new_price
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        print("\n=== TESTING INVALID AUTHENTICATION ===")
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "wrong@email.com", "password": "wrongpass"}
        )
        return success  # Success means we got 401 as expected

    def test_unauthorized_access(self):
        """Test unauthorized access to admin endpoints"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Admin Access",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = original_token
        return success  # Success means we got 401 as expected

def main():
    print("🚀 Starting Energica Store API Tests")
    print("=" * 50)
    
    tester = EnergicaStoreAPITester()
    
    # Test sequence
    tests = [
        ("Admin Login", tester.test_admin_login),
        ("Auth Me", tester.test_auth_me),
        ("Categories", tester.test_categories),
        ("Products List", tester.test_products_list),
        ("Category Filter", tester.test_products_category_filter),
        ("Search Products", tester.test_products_search),
        ("Sort Products", tester.test_products_sort),
        ("Product Detail", tester.test_product_detail),
        ("RFQ Creation", tester.test_rfq_creation),
        ("Admin RFQ List", tester.test_admin_rfq_list),
        ("Admin Product Update", tester.test_admin_product_update),
        ("Invalid Login", tester.test_invalid_login),
        ("Unauthorized Access", tester.test_unauthorized_access),
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if not result:
                print(f"⚠️  {test_name} test had issues")
        except Exception as e:
            print(f"💥 {test_name} test crashed: {str(e)}")
            tester.failed_tests.append(f"{test_name}: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print("📊 FINAL TEST RESULTS")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            print(f"   • {failure}")
    else:
        print("\n✅ ALL TESTS PASSED!")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())