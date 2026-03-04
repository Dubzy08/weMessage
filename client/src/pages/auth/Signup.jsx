import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import './Signup.css'
import { useNavigate } from 'react-router-dom';

function Signup() {
    const apiUrl = import.meta.env.VITE_WEMESSAGE_API_URL;
    const navigate = useNavigate();
    const[formData, setFormData] = useState({
        email:'',
        name:'',
        password:''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/user/register`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const result = await response.json();
            console.log(result);
            navigate('/login')
        } catch (error) {
            console.error(error.message);
        } finally {
            setFormData({
                email:'',
                name:'',
                password:'',
            })
        }
    }

    return (
        <div className='center-form'>
            <Form onSubmit={handleSubmit}>
                <h1>Signup</h1>
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
                <Form.Group controlId="formBasicName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                        type="name" 
                        name='name'
                        placeholder="Enter name"
                        value={formData.name}
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
                    Signup
                </Button>
            </Form>
        </div>
    )
}

export default Signup