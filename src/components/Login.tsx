@@ .. @@
 import React, { useState } from 'react';
 import { useApp } from '../context/AppContext';
 import { LogIn, Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
-import { v4 as uuidv4 } from 'uuid';
-import { User, UserRole } from '../types';
+import { UserRole } from '../types';
+import { authAPI, usersAPI } from '../services/api';

 export function Login() {
-  const { state, dispatch } = useApp();
+  const { dispatch, loadData } = useApp();
   const [isRegistering, setIsRegistering] = useState(false);
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
@@ -16,17 +15,25 @@
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [error, setError] = useState('');

-  const handleLogin = (e: React.FormEvent) => {
+  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
-    const user = state.users.find(u => 
-      u.username === username && 
-      u.password === password && 
-      u.role === selectedRole
-    );
-    
-    if (user) {
-      dispatch({ type: 'LOGIN', payload: user });
-      setError('');
-    } else {
-      setError('Invalid username, password, or role');
+    try {
+      const { user } = await authAPI.login(username, password, selectedRole);
+      dispatch({ type: 'LOGIN', payload: user });
+      await loadData();
+      setError('');
+    } catch (error: any) {
+      if (error.response?.status === 401) {
+        setError('Invalid username, password, or role');
+      } else {
+        setError('Login failed. Please try again.');
+      }
     }
   };

-  const handleRegister = (e: React.FormEvent) => {
+  const handleRegister = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (password !== confirmPassword) {
@@ -42,20 +49,19 @@
       return;
     }

-    const existingUser = state.users.find(u => u.username === username);
-    if (existingUser) {
-      setError('Username already exists');
-      return;
+    try {
+      const user = await usersAPI.create({
+        username,
+        password,
+        role: selectedRole
+      });
+      dispatch({ type: 'LOGIN', payload: user });
+      await loadData();
+      setError('');
+    } catch (error: any) {
+      if (error.response?.status === 400) {
+        setError('Username already exists');
+      } else {
+        setError('Registration failed. Please try again.');
+      }
     }

-    const newUser: User = {
-      id: uuidv4(),
-      username,
-      password,
-      role: selectedRole
-    };
-
-    dispatch({ type: 'ADD_USER', payload: newUser });
-    dispatch({ type: 'LOGIN', payload: newUser });
-    setError('');
   };