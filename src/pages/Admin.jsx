import { useState } from "react";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminCommissions from "../components/admin/AdminCommissions";
import AdminShipping from "../components/admin/AdminShipping";
import AdminDisputes from "../components/admin/AdminDisputes";
import AdminFAQ from "../components/admin/AdminFAQ";

const ADMIN_PASSWORD = "swingadmin2025!";

export default function Admin() {
  const [isAuth, setIsAuth] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogin = () => {
    if (pwd === ADMIN_PASSWORD) {
      setIsAuth(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  if (!isAuth) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f1923"}}>
        <div style={{background:"#1a2632",padding:"2.5rem",borderRadius:"12px",width:"100%",maxWidth:"380px"}}>
          <div style={{textAlign:"center",marginBottom:"2rem"}}>
            <div style={{fontSize:"2.5rem"}}>⛳</div>
            <h1 style={{color:"white",fontSize:"1.4rem",fontWeight:"600"}}>SwingMarketGolf</h1>
            <p style={{color:"#8899aa",fontSize:"0.85rem"}}>Accès Back Office</p>
          </div>
          <input
            type="password"
            placeholder="Mot de passe admin"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{width:"100%",padding:"0.75rem 1rem",borderRadius:"8px",border:"1px solid #2d4a5f",background:"#0f1923",color:"white",fontSize:"0.9rem",marginBottom:"0.8rem",outline:"none",boxSizing:"border-box"}}
          />
          {error && <p style={{color:"#ff6b6b",fontSize:"0.8rem",marginBottom:"0.8rem"}}>{error}</p>}
          <button
            onClick={handleLogin}
            style={{width:"100%",padding:"0.75rem",borderRadius:"8px",background:"#22c55e",border:"none",color:"white",fontWeight:"600",cursor:"pointer"}}
          >
            Accéder au Back Office
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "📊 Vue globale" },
    { id: "users", label: "👥 Utilisateurs" },
    { id: "products", label: "📦 Annonces" },
    { id: "orders", label: "🛒 Commandes" },
    { id: "commissions", label: "📈 Commissions" },
    { id: "shipping", label: "🚚 Transport" },
    { id: "disputes", label: "⚠️ Litiges" },
    { id: "faq", label: "❓ FAQ" },
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f8fafc"}}>
      <div style={{width:"240px",background:"#0f1923",padding:"1.5rem 0",flexShrink:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"0 1.5rem",marginBottom:"2rem"}}>
          <div style={{fontSize:"1.1rem",fontWeight:"700",color:"white"}}>⛳ Back Office</div>
          <div style={{fontSize:"0.75rem",color:"#8899aa",marginTop:"0.2rem"}}>SwingMarketGolf</div>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{width:"100%",textAlign:"left",padding:"0.75rem 1.5rem",background:activeTab===tab.id?"#1e3a4f":"transparent",border:"none",color:activeTab===tab.id?"white":"#8899aa",fontSize:"0.85rem",cursor:"pointer",borderLeft:activeTab===tab.id?"3px solid #22c55e":"3px solid transparent"}}
          >
            {tab.label}
          </button>
        ))}
        <div style={{padding:"1.5rem",marginTop:"auto"}}>
          <button
            onClick={() => setIsAuth(false)}
            style={{width:"100%",padding:"0.6rem",borderRadius:"6px",background:"transparent",border:"1px solid #2d4a5f",color:"#8899aa",fontSize:"0.8rem",cursor:"pointer"}}
          >
            Déconnexion
          </button>
        </div>
      </div>
      <div style={{flex:1,padding:"2rem",overflowY:"auto"}}>
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "commissions" && <AdminCommissions />}
        {activeTab === "shipping" && <AdminShipping />}
        {activeTab === "disputes" && <AdminDisputes />}
        {activeTab === "faq" && <AdminFAQ />}
      </div>
    </div>
  );
}