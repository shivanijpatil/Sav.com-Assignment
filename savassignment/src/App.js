import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReCAPTCHA from 'react-google-recaptcha';
import './App.css';

const ItemType = 'ITEM';

const DraggableItem = ({ item, index, moveItem }) => {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="draggable-item"
      style={{ transition: 'transform 0.2s ease-in-out' }}
    >
      <img src={item.image} alt={item.name} className="product-image" />
      <p>{item.name}</p>
      <p className="product-price">${item.price}</p>
    </div>
  );
};

const LoginSignup = ({ onLoginSuccess }) => {
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleCaptchaChange = (value) => {
    if (value) setCaptchaVerified(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      alert('Please complete the CAPTCHA!');
      return;
    }
    onLoginSuccess(true);
  };

  return (
    <div className="login-signup-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <ReCAPTCHA
          sitekey="6LdWCacqAAAAAC515r0g-993hsOE3ng6lFfQ_Upi"
          onChange={handleCaptchaChange}
        />
        <button type="submit" disabled={!captchaVerified}>
          Login
        </button>
      </form>
    </div>
  );
};

const MainContent = ({ onLogout }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((products) => {
        const excludedIds = [1, 2];
        const filteredProducts = products.filter(
          (product) => !excludedIds.includes(product.id)
        );
        setData(filteredProducts);
        setFilteredData(filteredProducts);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  };

  const loadAllProducts = () => {
    setFilteredData(data);
    setSearchTerm('');
  };

  const moveItem = (fromIndex, toIndex) => {
    const updatedData = [...filteredData];
    const [movedItem] = updatedData.splice(fromIndex, 1);
    updatedData.splice(toIndex, 0, movedItem);
    setFilteredData(updatedData);
  };

  const paginateData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="main-content">
      <header className="header">
        <h1>Welcome to the Product List</h1>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </header>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
        />
        <button onClick={loadAllProducts} className="load-button">
          Load All
        </button>
      </div>
      <DndProvider backend={HTML5Backend}>
        <div className="item-list">
          {paginateData.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={{ ...item, name: item.title }}
              index={index}
              moveItem={moveItem}
            />
          ))}
        </div>
      </DndProvider>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="app-container" >
      {!isLoggedIn ? (
        <LoginSignup onLoginSuccess={setIsLoggedIn} />
      ) : (
        <MainContent onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
