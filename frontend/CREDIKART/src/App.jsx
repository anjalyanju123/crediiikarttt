import './App.css'
import { BrowserRouter ,Routes ,Route} from 'react-router-dom';
import AdminDashboard from './Adminpages/AdminDashboard';
import Analytics from './Adminpages/Analytics';
import Shopkeepers from './Adminpages/Shopkeepers';
import CustomerRegister from './auth/CustomerRegister';
import Login from './auth/Login';
import ShopkeeperRegister from './auth/ShopkeeperRegister';
import RevenueAnalytics from './Adminpages/RevenueAnalytics';
import PendingShopkeepers from './Adminpages/PendingShopkeepers';
import Send_notifications from './Adminpages/Send_notifications';
import ManageProducts from './shopkeepersDashboard/ManageProducts';
import ShopDashboard from './shopkeepersDashboard/ShopDashboard';
import CustDashboard from './CustomersDashboard/CustDashboard';
import ListProducts from './CustomersDashboard/ListProducts';
import Customers from './shopkeepersDashboard/Customers';
import AdminCustomer from './Adminpages/AdminCustomer';
import Cart from './CustomersDashboard/Cart';
import Payment from './CustomersDashboard/Payement';
import CreditList from './CustomersDashboard/CreditList';
import CreditHistory from './CustomersDashboard/CreditHistory';
function App() {
 

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login />}/>
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/shopkeepers" element={<Shopkeepers />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path='/customer-register' element={<CustomerRegister />}/>
      <Route path='/shopkeepers-register' element={<ShopkeeperRegister />}/>
      <Route path='/admin-revenue' element={<RevenueAnalytics />}/>
      <Route path='/pending-shopkeepers' element={<PendingShopkeepers />}/>
      <Route path='/send-notifications' element={<Send_notifications />}/>
      <Route path='/admin-customers' element={<AdminCustomer />}/>


      <Route path='/shopkeeper-dashboard' element={<ShopDashboard />}/>
      <Route path='/manage-products' element={<ManageProducts />}/>
      <Route path="/customers" element={<Customers />} />

      <Route path='/customer-dashboard' element={<CustDashboard />}/>
      <Route path='/list-products' element={<ListProducts />}/>
      <Route path='/cart' element={<Cart />} />
      <Route path='/payment' element={<Payment/>}/>
      <Route path='/credit-list' element={<CreditList />}/>
      <Route path='/credit-history' element={<CreditHistory />}/>


    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
