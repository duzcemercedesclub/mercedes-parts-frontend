import React from "react";

const DemoNoticeModal = ({ onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "20px"
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "32px 28px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          border: "1px solid #e2e8f0"
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#fffbebe1",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            fontSize: "28px"
          }}
        >
          ⚠️
        </div>
        
        <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "20px", fontWeight: 700 }}>
          Bilgilendirme
        </h3>
        
        <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "16px", lineHeight: "1.5" }}>
          Bu site şu an deneme aşamasındadır.
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            backgroundColor: "#1677ff",
            color: "#ffffff",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0958d9")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#1677ff")}
        >
          Anladım, Devam Et
        </button>
      </div>
    </div>
  );
};

export default DemoNoticeModal;