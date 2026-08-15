import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './ProductDetail.css';

const formatHtmlDescription = (rawHtml) => {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/&nbsp;/g, ' ')
    .replace(/style="[^"]*"/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<span>\s*<\/span>/gi, '');
};

const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const ProductDetail = () => {
  const { id } = useParams();
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };

  const cartContext = useCart();
  const addToCart = cartContext?.addToCart || (() => {});
  const toggleWishlist = cartContext?.toggleWishlist || (() => {});
  const wishlist = cartContext?.wishlist || [];

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Yorumlar & Sorular State'leri
  const [reviewsData, setReviewsData] = useState({ reviews: [], totalReviews: 0, avgRating: 0 });
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionMessage, setQuestionMessage] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Ürün detayı getirilemedi:', err);
        setError('Ürün bilgileri yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
      fetchReviews();
      fetchQuestions();
    }
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/${id}/reviews`);
      setReviewsData(res.data);
    } catch (err) {
      console.error('Yorumlar yüklenemedi:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/${id}/questions`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Sorular yüklenemedi:', err);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!token) {
      setQuestionMessage({ type: 'error', text: 'Soru sorabilmek için giriş yapmalısınız.' });
      return;
    }
    if (!newQuestion.trim()) return;

    setSubmittingQuestion(true);
    setQuestionMessage(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/products/${id}/questions`,
        { question: newQuestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestionMessage({ type: 'success', text: res.data.message });
      setNewQuestion('');
      fetchQuestions();
    } catch (err) {
      setQuestionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Soru gönderilirken bir hata oluştu.'
      });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3>Ürün Detayı Yükleniyor...</h3>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3>Ürün Bulunamadı!</h3>
        <p>{error || 'İstediğiniz yedek parça sisteme kayıtlı değil veya kaldırılmış olabilir.'}</p>
        <Link to="/" style={{ color: '#2b4c7e', fontWeight: 'bold' }}>Anasayfaya Dön</Link>
      </div>
    );
  }

  const stock = Number(product.stock || 0);
  const originalPrice = Number(product.price || 0);
  const discountRate = Number(product.discount_rate || 0);
  const salePrice = product.sale_price !== undefined ? Number(product.sale_price) : originalPrice;
  const hasDiscount = discountRate > 0 || salePrice < originalPrice;
  const effectivePrice = hasDiscount ? salePrice : originalPrice;
  const isFavorite = wishlist.some((item) => item.id === product.id);

  const mainImage = product.image_url || product.img_url || 'https://via.placeholder.com/500x450?text=Görsel+Yok';

  const handleQuantityChange = (type) => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'increase' && quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (stock === 0) return;
    const itemToCart = {
      ...product,
      id: product.id || product._id,
      name: product.name,
      price: effectivePrice,
      originalPrice: originalPrice,
      hasDiscount: hasDiscount,
      imgUrl: mainImage,
      brand: product.brand_name || product.brand || 'OEM',
      condition_type: product.condition_type || product.condition || 'new'
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(itemToCart);
    }
  };

  const plainDescription = stripHtmlTags(product.description);

  return (
    <div className="product-detail-page container">
      <div className="detail-breadcrumb">
        <Link to="/">Anasayfa</Link> / 
        <Link to="/shop"> Ürünler</Link> / 
        {product.category_name && <span> {product.category_name} / </span>}
        <span> {product.name}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-media">
          <div className="main-image-wrapper">
            {hasDiscount && stock > 0 && (
              <span className="badge-sale">
                -%{discountRate} İNDİRİM
              </span>
            )}
            <img src={mainImage} alt={product.name} />
          </div>
        </div>

        <div className="detail-info">
          <span className="info-brand">
            {product.brand_name || product.brand || 'MAĞAZA OEM'}
          </span>
          
          <h1 className="info-title">{product.name}</h1>
          
          {/* Uyumlu Şase Numarası Rozeti */}
          {product.vin_code && (
            <div style={{ margin: '8px 0', padding: '6px 12px', background: '#e6f7ff', border: '1px solid #91caff', borderRadius: '6px', fontSize: '13px', color: '#0958d9', display: 'inline-block' }}>
              🚗 <strong>Uyumlu Şase (VIN):</strong> {product.vin_code}
            </div>
          )}

          <div className="info-rating">
            <span className="stars">
              {'★'.repeat(Math.round(reviewsData.avgRating)) + '☆'.repeat(5 - Math.round(reviewsData.avgRating))}
            </span>
            <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{reviewsData.avgRating} / 5</span>
            <span>({reviewsData.totalReviews} Onaylı Değerlendirme)</span>
          </div>

          <div className="info-price-row">
            {hasDiscount && (
              <span className="info-old-price">{originalPrice.toFixed(2)} TL</span>
            )}
            <span className="info-new-price">{salePrice.toFixed(2)} TL</span>
          </div>

          <p className="info-desc">
            {plainDescription 
              ? (plainDescription.length > 180 ? `${plainDescription.substring(0, 180)}...` : plainDescription)
              : 'Yüksek kaliteli ürün.'}
          </p>

          <div className="info-actions">
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1 || stock === 0}>-</button>
              <input type="text" value={stock === 0 ? 0 : quantity} readOnly />
              <button onClick={() => handleQuantityChange('increase')} disabled={quantity >= stock || stock === 0}>+</button>
            </div>

            <button 
              className="btn-add-to-cart" 
              onClick={handleAddToCart} 
              disabled={stock === 0}
              style={{
                backgroundColor: stock === 0 ? '#999' : '#1677ff',
                cursor: stock === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </button>

            <button 
              className={`btn-wishlist-toggle ${isFavorite ? 'active' : ''}`} 
              onClick={() => toggleWishlist(product)}
            >
              ♥
            </button>
          </div>
        </div>
      </div>

      {/* TABS ALANI */}
      <div className="product-tabs-wrapper" style={{ marginTop: '60px' }}>
        <div className="tab-headers" style={{ display: 'flex', borderBottom: '2px solid #eaeaea', gap: '30px' }}>
          <button 
            onClick={() => setActiveTab('description')} 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
          >
            Ürün Açıklaması
          </button>
          <button 
            onClick={() => setActiveTab('reviews')} 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            Değerlendirmeler ({reviewsData.totalReviews})
          </button>
          <button 
            onClick={() => setActiveTab('questions')} 
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          >
            Soru & Cevap ({questions.length})
          </button>
        </div>

        <div className="tab-content" style={{ padding: '25px 0', lineHeight: '1.7', color: '#444' }}>
          {activeTab === 'description' && (
            <div>
              <h4 style={{ marginBottom: '15px', color: '#1a1a1a', fontSize: '18px' }}>Ürün Detayı</h4>
              {product.description ? (
                <div 
                  className="formatted-description"
                  dangerouslySetInnerHTML={{ __html: formatHtmlDescription(product.description) }} 
                />
              ) : (
                <p>Detaylı açıklama bulunmamaktadır.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab-container">
              <div style={{ backgroundColor: '#e6f7ff', border: '1px solid #91caff', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#0958d9' }}>
                  ℹ️ <strong>Nasıl değerlendirme yapabilirim?</strong> Değerlendirmeler yalnızca ürünü satın alıp teslim alan müşterilerimiz tarafından <strong>Hesabım &gt; Değerlendirmelerim</strong> sayfasından yapılabilmektedir.
                </p>
              </div>

              <div className="rating-summary-box">
                <div className="score-side">
                  <h2>{reviewsData.avgRating}</h2>
                  <div className="stars">
                    {'★'.repeat(Math.round(reviewsData.avgRating)) + '☆'.repeat(5 - Math.round(reviewsData.avgRating))}
                  </div>
                  <p>{reviewsData.totalReviews} Kullanıcı Değerlendirdi</p>
                </div>
              </div>

              <div className="reviews-list" style={{ marginTop: '30px' }}>
                {reviewsData.reviews.length === 0 ? (
                  <p className="no-data-text">Bu ürün için henüz onaylanmış bir değerlendirme yapılmamıştır.</p>
                ) : (
                  reviewsData.reviews.map((rev) => (
                    <div key={rev.id} className="review-card" style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12 }}>
                      <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong className="user-name">{rev.userName}</strong>
                        <span className="review-date" style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {new Date(rev.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="review-rating" style={{ color: '#faad14' }}>
                        {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                      </div>
                      <p className="review-comment" style={{ marginTop: 6 }}>"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="questions-tab-container">
              <div className="ask-question-card" style={{ backgroundColor: '#fafafa', padding: 20, borderRadius: 10, marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Satıcıya Soru Sor</h4>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  Ürün uyumluluğu, stok veya teslimat hakkında merak ettiklerinizi sorabilirsiniz.
                </p>
                {questionMessage && (
                  <div className={`msg-alert ${questionMessage.type}`} style={{ marginBottom: 12, padding: 10, borderRadius: 6, backgroundColor: questionMessage.type === 'success' ? '#f6ffed' : '#fff2f0' }}>
                    {questionMessage.text}
                  </div>
                )}
                <form onSubmit={handleAskQuestion}>
                  <textarea
                    rows="3"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Sorunuzu yazınız..."
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d9d9d9', marginBottom: 10 }}
                    required
                  />
                  <button type="submit" className="btn-submit-question" disabled={submittingQuestion} style={{ padding: '8px 20px', backgroundColor: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    {submittingQuestion ? 'Gönderiliyor...' : 'Soruyu Gönder'}
                  </button>
                </form>
              </div>

              <div className="questions-list">
                <h4 style={{ marginBottom: '15px' }}>Ürün Hakkındaki Sorular ve Cevaplar</h4>
                {questions.length === 0 ? (
                  <p className="no-data-text">Bu ürün için henüz soru sorulmamıştır.</p>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="question-card" style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div className="q-box">
                        <span style={{ fontWeight: 'bold', color: '#1677ff' }}>Soru: </span>
                        <span>{q.question}</span>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                          {q.userName} | {new Date(q.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      {q.answer ? (
                        <div className="a-box" style={{ marginTop: 10, padding: 10, backgroundColor: '#f6ffed', borderRadius: 6 }}>
                          <span style={{ fontWeight: 'bold', color: '#52c41a' }}>Mağaza Cevabı: </span>
                          <span>{q.answer}</span>
                          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                            {q.answeredAt ? new Date(q.answeredAt).toLocaleDateString('tr-TR') : ''}
                          </div>
                        </div>
                      ) : (
                        <div className="a-pending" style={{ marginTop: 8, fontSize: 12, color: '#fa8c16' }}>
                          ⏳ Mağaza bu soruyu henüz yanıtlamadı.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;