import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Signup.css'

function Login() {
    const apiUrl = import.meta.env.VITE_WEMESSAGE_API_URL;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (event) =>{
        const { name, value } = event.target;
        setFormData({
            ...formData, 
            [name]: value
        });
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if(!response.ok) {
                console.log('Login failed:', response.status);
                return;
            }

            const result = await response.json();
            const user = result.user;
            sessionStorage.setItem('token', result.token);
            console.log(result);
            sessionStorage.setItem('user', JSON.stringify({
                id: user._id,
                name: user.name
            }));
            navigate('/messenger');
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className='center-form'>
            <Form onSubmit={handleSubmit}>
                <h1>Login</h1>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        name='email'
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        name='password'
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Button variant='dark' type='submit' className='2w-100'>
                    Login
                </Button>
            </Form>
        </div>
    )
}

export default Login