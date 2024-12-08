document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const department = document.getElementById('department').value;

        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, department }),
        });

        if (response.ok) {
            alert('Account created successfully!');
            window.location.href = 'login.html';
        } else {
            const data = await response.json();
            alert(data.message || 'Error creating account. Please try again.');
        }
    });
});
