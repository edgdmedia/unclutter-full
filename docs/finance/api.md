# Accounts API

## GET - finance/accounts
### Response: 
{
    "success": true,
    "data": [
        {
            "id": "1",
            "profile_id": "6",
            "name": "GTBAnkghgh",
            "type_id": "1",
            "balance": "15100.00",
            "description": "kfjkfkdf jhhjjhh kjjjkkjk",
            "institution": "GT Bank",
            "is_active": "1",
            "created_at": "2025-05-01 22:35:16",
            "updated_at": "2025-05-03 16:01:50",
            "type_name": "Checking",
            "category_type": "account_type"
        }
    ],
    "total_balance": 15100
}

## POST - finance/accounts
### Request: 
{
    "name":"test",
    "type_id": 1,
    "balance": 1000,
    "description": "Test Description",
    "institution": "GTBAnk",
    "color":""
}
### Response: 
{
    "success": true,
    "data": {
        "id": "2",
        "profile_id": "6",
        "name": "test",
        "type_id": "1",
        "balance": "1000.00",
        "description": "Test Description",
        "institution": "GTBAnk",
        "is_active": "1",
        "created_at": "2025-05-03 16:41:14",
        "updated_at": "2025-05-03 16:41:14",
        "type_name": "Checking",
        "category_type": "account_type"
    }
}

## GET - finance/accounts/{id}
### Response: 
{
    "success": true,
    "data": {
        "id": "1",
        "profile_id": "6",
        "name": "GTBAnkghgh",
        "type_id": "1",
        "balance": "15100.00",
        "description": "kfjkfkdf jhhjjhh kjjjkkjk",
        "institution": "GT Bank",
        "is_active": "1",
        "created_at": "2025-05-01 22:35:16",
        "updated_at": "2025-05-03 16:01:50",
        "type_name": "Checking",
        "category_type": "account_type"
    }
}

## PUT - finance/accounts/{id}
### Request: 
{
    "name":"test",
    "type_id": 1,
    "balance": 1000,
    "description": "Test Description",
    "institution": "GTBAnk",
    "color":""
}
### Response: 
{
    "success": true,
    "data": {
        "id": "2",
        "profile_id": "6",
        "name": "test",
        "type_id": "1",
        "balance": "1000.00",
        "description": "Test Description",
        "institution": "GTBAnk",
        "is_active": "1",
        "created_at": "2025-05-03 16:41:14",
        "updated_at": "2025-05-03 16:41:14",
        "type_name": "Checking",
        "category_type": "account_type"
    }
}

## DELETE - finance/accounts/{id}
### Response: 
{
    "success": true,
    "data": {
        "id": "2",
        "profile_id": "6",
        "name": "test",
        "type_id": "1",
        "balance": "1000.00",
        "description": "Test Description",
        "institution": "GTBAnk",
        "is_active": "1",
        "created_at": "2025-05-03 16:41:14",
        "updated_at": "2025-05-03 16:41:14",
        "type_name": "Checking",
        "category_type": "account_type"
    }
}

## GET - finance/accounts/{id}/balance-history
### Request: 
{
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
}
### Response: 
{
    "success": true,
    "data": [
        {
            "date": "2025-01-01",
            "balance": "1000.00"
        }
    ]
}

## GET - finance/accounts/search
### Request: 
{
    "search": "test"
}
### Response: 
{
    "success": true,
    "data": [
        {
            "id": "1",
            "profile_id": "6",
            "name": "GTBAnkghgh",
            "type_id": "1",
            "balance": "15100.00",
            "description": "kfjkfkdf jhhjjhh kjjjkkjk",
            "institution": "GT Bank",
            "is_active": "1",
            "created_at": "2025-05-01 22:35:16",
            "updated_at": "2025-05-03 16:01:50",
            "type_name": "Checking",
            "category_type": "account_type"
        }
    ]
}

## GET - finance/transactions?account_id=XXX&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&per_page=20&page=1
### Request: 
{
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "page": 1,
    "per_page": 10,
    "order": "asc",
    "order_by": "created_at"
}
## Response: 
{
    "success": true,
    "data": [
        {
            "id": "1",
            "profile_id": "6",
            "name": "GTBAnkghgh",
            "type_id": "1",
            "balance": "15100.00",
            "description": "kfjkfkdf jhhjjhh kjjjkkjk",
            "institution": "GT Bank",
            "is_active": "1",
            "created_at": "2025-05-01 22:35:16",
            "updated_at": "2025-05-03 16:01:50",
            "type_name": "Checking",
            "category_type": "account_type"
        }
    ],
    "total": 1,
    "page": 1,
    "pages": 1,
    "per_page": 10
}


# Dashboard API
## GET - finance/dashboard/summary
### Response: 
{
    "success": true,
    "data": {
        "total_income": 15000,
        "total_expenses": 0,
        "net_balance": 15000,
        "accounts": [
            {
                "id": "1",
                "profile_id": "6",
                "name": "GTBAnkghgh",
                "type_id": "1",
                "balance": "15100.00",
                "description": "kfjkfkdf jhhjjhh kjjjkkjk",
                "institution": "GT Bank",
                "is_active": "1",
                "created_at": "2025-05-01 22:35:16",
                "updated_at": "2025-05-03 16:01:50",
                "type_name": "Checking",
                "category_type": "account_type"
            },
            {
                "id": "2",
                "profile_id": "6",
                "name": "test",
                "type_id": "1",
                "balance": "1000.00",
                "description": "Test Description",
                "institution": "GTBAnk",
                "is_active": "1",
                "created_at": "2025-05-03 16:41:14",
                "updated_at": "2025-05-03 16:41:14",
                "type_name": "Checking",
                "category_type": "account_type"
            }
        ]
    }
}

## GET - finance/dashboard/trends
### Response: 
{
    "success": true,
    "data": {
        "labels": [
            "Dec 2024",
            "Jan 2025",
            "Feb 2025",
            "Mar 2025",
            "Apr 2025",
            "May 2025"
        ],
        "income": [
            0,
            0,
            0,
            0,
            0,
            15000
        ],
        "expenses": [
            0,
            0,
            0,
            0,
            0,
            0
        ]
    }
}

# Transactions API

## GET - finance/transactions
### Request: 
{
    "account_id": "",
    "start_date": ",
    "end_date": "",
    "page": 1,
    "per_page": 10,
    "order": "desc",
    "order_by": "created_at"
}
### Response: 
{
    "success": true,
    "data": [
        {
            "id": "3",
            "profile_id": "6",
            "account_id": "1",
            "category_id": "2",
            "amount": "5000.00",
            "transaction_date": "2025-05-02",
            "description": null,
            "notes": null,
            "type": "income",
            "created_at": "2025-05-03 15:52:45",
            "updated_at": "2025-05-03 15:52:45",
            "account_name": "GTBAnkghgh",
            "category_name": "Savings",
            "tags": [
                {
                    "id": "12",
                    "profile_id": "0",
                    "name": "Housing",
                    "type": "expense",
                    "parent_id": null,
                    "description": "Rent, mortgage, property taxes",
                    "is_active": "1",
                    "created_at": "2025-05-01 18:49:18",
                    "updated_at": "2025-05-01 18:49:18"
                },
                {
                    "id": "13",
                    "profile_id": "0",
                    "name": "Utilities",
                    "type": "expense",
                    "parent_id": null,
                    "description": "Electricity, water, gas, internet",
                    "is_active": "1",
                    "created_at": "2025-05-01 18:49:18",
                    "updated_at": "2025-05-01 18:49:18"
                }
            ],
            "attachments": []
        },
        {
            "id": "2",
            "profile_id": "6",
            "account_id": "1",
            "category_id": "1",
            "amount": "5000.00",
            "transaction_date": "2025-05-02",
            "description": null,
            "notes": null,
            "type": "income",
            "created_at": "2025-05-03 15:48:40",
            "updated_at": "2025-05-03 15:48:40",
            "account_name": "GTBAnkghgh",
            "category_name": "Checking",
            "tags": [],
            "attachments": []
        }
    ],
    "pagination": {
        "total": 3,
        "per_page": 2,
        "page": 1,
        "total_pages": 2
    }
}





## POST - finance/transactions
### Request: 
{
    "amount": 4300,
    "type": "expense",
    "transaction_date": "2025-05-02",
    "category_id": 2,
    "description": "School Fee",
    "notes": "hjdfjfhjfd",
    "account_id": 1,
    "tags": [12,13],
    "attachments": []
}
### Response: 
{
    "success": true,
    "data": {
        "id": "6",
        "profile_id": "6",
        "account_id": "1",
        "category_id": "9",
        "amount": "2300.00",
        "transaction_date": "2025-05-02",
        "description": "School Fee",
        "notes": "hjdfjfhjfd",
        "type": "expense",
        "created_at": "2025-05-03 18:18:04",
        "updated_at": "2025-05-03 18:18:04",
        "account_name": "GTBAnkghgh",
        "category_name": "Interest"
    }
}

## GET - finance/transactions/{id}
### Response: 
{
    "success": true,
    "data": {
        "id": "6",
        "profile_id": "6",
        "account_id": "1",
        "category_id": "9",
        "amount": "2300.00",
        "transaction_date": "2025-05-02",
        "description": "School Fee",
        "notes": "hjdfjfhjfd",
        "type": "expense",
        "created_at": "2025-05-03 18:18:04",
        "updated_at": "2025-05-03 18:18:04",
        "account_name": "GTBAnkghgh",
        "category_name": "Interest",
        "tags": [
            {
                "id": "12",
                "profile_id": "0",
                "name": "Housing",
                "type": "expense",
                "parent_id": null,
                "description": "Rent, mortgage, property taxes",
                "is_active": "1",
                "created_at": "2025-05-01 18:49:18",
                "updated_at": "2025-05-01 18:49:18"
            },
            {
                "id": "13",
                "profile_id": "0",
                "name": "Utilities",
                "type": "expense",
                "parent_id": null,
                "description": "Electricity, water, gas, internet",
                "is_active": "1",
                "created_at": "2025-05-01 18:49:18",
                "updated_at": "2025-05-01 18:49:18"
            }
        ],
        "attachments": []
    }
}

## PUT - finance/transactions/{id}
### Request: 
{
    "amount": 4300,
    "type": "expense",
    "transaction_date": "2025-05-02",
    "category_id": 2,
    "description": "School Fee",
    "notes": "hjdfjfhjfd",
    "account_id": 1,
    "tags": [12,13],
    "attachments": []
}
### Response: 
{
    "success": true
}

## DELETE - finance/transactions/{id}
### Response: 
{
    "success": true,
}


# Categories API
## GET - finance/categories
### Response: 
{
    "success": true,
    "data": [
        {
            "id": "6",
            "profile_id": "0",
            "name": "Cash",
            "type": "account_type",
            "parent_id": null,
            "description": "Cash account",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "1",
            "profile_id": "0",
            "name": "Checking",
            "type": "account_type",
            "parent_id": null,
            "description": "Checking account",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "3",
            "profile_id": "0",
            "name": "Credit Card",
            "type": "account_type",
            "parent_id": null,
            "description": "Credit card account",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "4",
            "profile_id": "0",
            "name": "Investment",
            "type": "account_type",
            "parent_id": null,
            "description": "Investment account",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "5",
            "profile_id": "0",
            "name": "Loan",
            "type": "account_type",
            "parent_id": null,
            "description": "Loan account",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "2",
            "profile_id": "0",
            "name": "Savings",
            "type": "account_type",
            "parent_id": null,
            "description": "Savings account",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "10",
            "profile_id": "0",
            "name": "Church",
            "type": "tag",
            "parent_id": null,
            "description": "Church expenses",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "8",
            "profile_id": "0",
            "name": "Education",
            "type": "tag",
            "parent_id": null,
            "description": "Education expenses",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "11",
            "profile_id": "0",
            "name": "Gifts",
            "type": "income",
            "parent_id": null,
            "description": "Money received as gifts",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "9",
            "profile_id": "0",
            "name": "Interest",
            "type": "income",
            "parent_id": null,
            "description": "Interest income from investments",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "7",
            "profile_id": "0",
            "name": "Salary",
            "type": "income",
            "parent_id": null,
            "description": "Regular employment income",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "16",
            "profile_id": "0",
            "name": "Dining Out",
            "type": "expense",
            "parent_id": null,
            "description": "Restaurants, cafes, takeout",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "19",
            "profile_id": "0",
            "name": "Education",
            "type": "expense",
            "parent_id": null,
            "description": "Tuition, books, courses",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "17",
            "profile_id": "0",
            "name": "Entertainment",
            "type": "expense",
            "parent_id": null,
            "description": "Movies, events, subscriptions",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "14",
            "profile_id": "0",
            "name": "Groceries",
            "type": "expense",
            "parent_id": null,
            "description": "Food and household supplies",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "18",
            "profile_id": "0",
            "name": "Healthcare",
            "type": "expense",
            "parent_id": null,
            "description": "Medical expenses, insurance",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "12",
            "profile_id": "0",
            "name": "Housing",
            "type": "expense",
            "parent_id": null,
            "description": "Rent, mortgage, property taxes",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "20",
            "profile_id": "0",
            "name": "Shopping",
            "type": "expense",
            "parent_id": null,
            "description": "Clothing, electronics, personal items",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "22",
            "profile_id": "6",
            "name": "Tithe",
            "type": "expense",
            "parent_id": "0",
            "description": "test",
            "is_active": "1",
            "created_at": "2025-05-03 09:00:48",
            "updated_at": "2025-05-03 09:00:48"
        },
        {
            "id": "15",
            "profile_id": "0",
            "name": "Transportation",
            "type": "expense",
            "parent_id": null,
            "description": "Gas, public transit, car maintenance",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "21",
            "profile_id": "0",
            "name": "Travel",
            "type": "expense",
            "parent_id": null,
            "description": "Vacations, trips, hotels",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        },
        {
            "id": "13",
            "profile_id": "0",
            "name": "Utilities",
            "type": "expense",
            "parent_id": null,
            "description": "Electricity, water, gas, internet",
            "is_active": "1",
            "created_at": "2025-05-01 18:49:18",
            "updated_at": "2025-05-01 18:49:18"
        }
    ]
}

## GET - finance/categories/search?search=tithe
### Response: 
{
    "success": true,
    "data": [
        {
            "id": "22",
            "profile_id": "6",
            "name": "Tithe",
            "type": "expense",
            "parent_id": "0",
            "description": "test",
            "is_active": "1",
            "created_at": "2025-05-03 09:00:48",
            "updated_at": "2025-05-03 09:00:48"
        }
    ]
}

## GET - finance/categories/{id}
### Response: 
{
    "success": true,
    "data": {
        "id": "13",
        "profile_id": "0",
        "name": "Utilities",
        "type": "expense",
        "parent_id": null,
        "description": "Electricity, water, gas, internet",
        "is_active": "1",
        "created_at": "2025-05-01 18:49:18",
        "updated_at": "2025-05-01 18:49:18",
        "children": []
    },
    "message": ""
}

## PUT - finance/categories/{id} 
(can only update category when profile_id != 0. 0 means it is a global category)
### Request: 
{
    "name": "Utilities",
    "type": "expense",
    "parent_id": null,
    "description": "Electricity, water, gas, internet",
    "is_active": "1"
}
### Response: 
{
    "success": true,
    "data": {
        "id": "13",
        "profile_id": "0",
        "name": "Utilities",
        "type": "expense",
        "parent_id": null,
        "description": "Electricity, water, gas, internet",
        "is_active": "1",
        "created_at": "2025-05-01 18:49:18",
        "updated_at": "2025-05-01 18:49:18",
        "children": []
    }
}

## DELETE - finance/categories/{id}
(can only delete category when profile_id != 0. 0 means it is a global category)
### Response: 
{
    "success": true
}





## POST - finance/categories
### Request: 
{
    "name": "Utilities",
    "type": "expense",
    "parent_id": null,
    "description": "Electricity, water, gas, internet",
    "is_active": "1"
}
### Response: 
{
    "success": true,
    "data": {
        "id": "13",
        "profile_id": "0",
        "name": "Utilities",
        "type": "expense",
        "parent_id": null,
        "description": "Electricity, water, gas, internet",
        "is_active": "1",
        "created_at": "2025-05-01 18:49:18",
        "updated_at": "2025-05-01 18:49:18",
        "children": []
    }
}