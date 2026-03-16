// Store global usando Supabase + React hooks
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAppStore() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados iniciais
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [clientsRes, productsRes, transactionsRes] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('transactions').select('*').order('date', { ascending: false })
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== CLIENTES =====
  const addClient = useCallback(async (client) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          name: client.name,
          cpf: client.cpf,
          phone: client.phone,
          address: client.address 
        }])
        .select()
        .single();

      if (error) throw error;
      setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Erro ao adicionar cliente:', err);
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id, fields) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(fields)
        .eq('id', id);

      if (error) throw error;
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c));
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== id));
      setTransactions(prev => prev.filter(t => t.client_id !== id));
    } catch (err) {
      console.error('Erro ao deletar cliente:', err);
      throw err;
    }
  }, []);

  // ===== PRODUTOS =====
  const addProduct = useCallback(async (product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          stock: Number(product.stock),
          price: Number(product.price)
        }])
        .select()
        .single();

      if (error) throw error;
      setProducts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id, fields) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(fields)
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      throw err;
    }
  }, []);

  // ===== TRANSAÇÕES =====
  const addPurchase = useCallback(async (clientId, { productId, productName, quantity, unitPrice, obs, date }) => {
    try {
      const total = Number(quantity) * Number(unitPrice);
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          client_id: clientId,
          type: 'buy',
          product_id: productId,
          product_name: productName,
          quantity: Number(quantity),
          unit_price: Number(unitPrice),
          total,
          date: date || new Date().toISOString(),
          obs: obs || ''
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar estoque do produto
      if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
          await updateProduct(productId, { stock: Math.max(0, product.stock - Number(quantity)) });
        }
      }

      setTransactions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao adicionar compra:', err);
      throw err;
    }
  }, [products, updateProduct]);

  const addPayment = useCallback(async (clientId, { amount, method, obs, date }) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          client_id: clientId,
          type: 'pay',
          amount: Number(amount),
          method,
          date: date || new Date().toISOString(),
          obs: obs || ''
        }])
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao adicionar pagamento:', err);
      throw err;
    }
  }, []);

  const updateTransaction = useCallback(async (txId, fields) => {
    try {
      const oldTx = transactions.find(t => t.id === txId);
      if (!oldTx) return;

      const { data, error } = await supabase
        .from('transactions')
        .update(fields)
        .eq('id', txId)
        .select()
        .single();

      if (error) throw error;

      // Ajuste de estoque se a quantidade mudou
      if (oldTx.type === 'buy' && fields.quantity !== undefined && oldTx.product_id) {
        const diff = Number(fields.quantity) - oldTx.quantity;
        const product = products.find(p => p.id === oldTx.product_id);
        if (product) {
          await updateProduct(oldTx.product_id, { stock: Math.max(0, product.stock - diff) });
        }
      }

      setTransactions(prev => prev.map(t => t.id === txId ? data : t));
    } catch (err) {
      console.error('Erro ao atualizar transação:', err);
      throw err;
    }
  }, [transactions, products, updateProduct]);

  const deleteTransaction = useCallback(async (txId) => {
    try {
      const tx = transactions.find(t => t.id === txId);
      if (!tx) return;

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', txId);

      if (error) throw error;

      // Devolver estoque se for uma compra
      if (tx.type === 'buy' && tx.product_id) {
        const product = products.find(p => p.id === tx.product_id);
        if (product) {
          await updateProduct(tx.product_id, { stock: product.stock + tx.quantity });
        }
      }

      setTransactions(prev => prev.filter(t => t.id !== txId));
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
      throw err;
    }
  }, [transactions, products, updateProduct]);

  // ===== COMPUTED =====
  const getClientDebt = useCallback((clientId) => {
    const txs = transactions.filter(t => t.client_id === clientId);
    const totalBuy = txs.filter(t => t.type === 'buy').reduce((acc, t) => acc + (t.total || 0), 0);
    const totalPay = txs.filter(t => t.type === 'pay').reduce((acc, t) => acc + (t.amount || 0), 0);
    return Math.max(0, totalBuy - totalPay);
  }, [transactions]);

  const getClientTransactions = useCallback((clientId) => {
    return transactions.filter(t => t.client_id === clientId);
  }, [transactions]);

  return {
    clients,
    products,
    transactions,
    loading,
    error,
    addClient, updateClient, deleteClient,
    addProduct, updateProduct, deleteProduct,
    addPurchase, addPayment, updateTransaction, deleteTransaction,
    getClientDebt, getClientTransactions,
    refresh: fetchData
  };
}
