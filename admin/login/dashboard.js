const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable").getElementsByTagName("tbody")[0];
const token = localStorage.getItem("atoken"); // Assuming you store the token in localStorage

// Fetch and display products
async function fetchProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    if (data.success) {
        productTable.innerHTML = ""; // Clear existing rows
        data.products.forEach(product => {
            const row = productTable.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.price}</td>
                <td>
                    <button onclick="editProduct('${product.id}')">Edit</button>
                    <button onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            `;
        });
    } else {
        alert("Error fetching products");
    }
}

// Add or update product
productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("productId").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/products/${id}` : `/api/products`;

    const productData = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        price: parseFloat(document.getElementById("price").value),
        images: document.getElementById("images").value.split(","),
        category: document.getElementById("category").value,
        stock: parseInt(document.getElementById("stock").value),
        AffiliateLink: document.getElementById("affiliateLink").value,
    };

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "atoken": token, // Include the token in the headers
        },
        body: JSON.stringify(productData),
    });

    const data = await response.json();
    if (data.success) {
        alert("Product saved successfully");
        fetchProducts(); // Refresh the product list
        productForm.reset(); // Reset the form
    } else {
        alert("Error saving product");
    }
});

// Edit product
function editProduct(id) {
    const row = productTable.querySelector(`tr[data-id='${id}']`);
    const product = {
        id: row.cells[0].innerText,
        name: row.cells[1].innerText,
        description: row.cells[2].innerText,
        price: row.cells[3].innerText,
    };

    document.getElementById("productId").value = product.id;
    document.getElementById("name").value = product.name;
    document.getElementById("description").value = product.description;
    document.getElementById("price").value = product.price;
    // Populate other fields as necessary
}

// Delete product
async function deleteProduct(id) {
    const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
            "atoken": token, // Include the token in the headers
        },
    });

    const data = await response.json();
    if (data.success) {
        alert("Product deleted successfully");
        fetchProducts(); // Refresh the product list
    } else {
        alert("Error deleting product");
    }
}

// Initial fetch of products
fetchProducts();
