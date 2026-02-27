import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Signup.css'

function Login() {

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
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            localStorage.setItem('token', result.token);
            console.log(result);
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