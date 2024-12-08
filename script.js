document.addEventListener('DOMContentLoaded', () => {
    const complaintForm = document.getElementById('complaintForm');
    const complaintsList = document.getElementById('complaints');
    const userInfo = document.getElementById('userInfo');
    const logoutButton = document.getElementById('logoutButton');

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    } else {
        fetchUserInfo();
        logoutButton.style.display = 'block';
    }

    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const department = document.getElementById('department').value;
        const complaint = document.getElementById('complaint').value;
        const headOfDepartmentEmail = 'nskvip0@gmail.com';

        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, department, complaint, headOfDepartmentEmail }),
        });

        if (response.ok) {
            alert('Complaint submitted successfully!');
            complaintForm.reset();
            fetchComplaints();
        } else {
            alert('Error submitting complaint. Please try again.');
        }
    });

    async function fetchComplaints() {
        const response = await fetch('/api/complaints', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const complaints = await response.json();

        complaintsList.innerHTML = '';
        complaints.forEach(complaint => {
            const li = document.createElement('li');
            li.textContent = `${complaint.name} (${complaint.department}): ${complaint.complaint}`;
            complaintsList.appendChild(li);
        });
    }

    async function fetchUserInfo() {
        const response = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const user = await response.json();
        userInfo.textContent = `Welcome, ${user.name} (${user.department})`;
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    fetchComplaints();
});
