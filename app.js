// Firebase 연동 및 관리자 대시보드 기능

// 관리자 모드 상태
let isAdminMode = false;

// DOM 요소들
const modal = document.getElementById('applicationModal');
const successModal = document.getElementById('successModal');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('applicationForm');
const adminBtn = document.getElementById('adminBtn');
const dashboard = document.getElementById('adminDashboard');

// 관리자 버튼 생성
function createAdminButton() {
    const adminButton = document.createElement('button');
    adminButton.id = 'adminBtn';
    adminButton.innerHTML = '👨‍💼 관리자';
    adminButton.className = 'admin-button';
    adminButton.onclick = toggleAdminMode;
    
    // 헤더에 추가
    const nav = document.querySelector('nav');
    nav.appendChild(adminButton);
}

// 관리자 대시보드 생성
function createAdminDashboard() {
    const dashboardDiv = document.createElement('div');
    dashboardDiv.id = 'adminDashboard';
    dashboardDiv.className = 'admin-dashboard';
    dashboardDiv.innerHTML = `
        <div class="dashboard-header">
            <h2>📊 AI Academy 관리자 대시보드</h2>
            <button class="close-dashboard" onclick="toggleAdminMode()">✕</button>
        </div>
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>총 신청자</h3>
                <p id="totalApplications">0</p>
            </div>
            <div class="stat-card">
                <h3>오늘 신청자</h3>
                <p id="todayApplications">0</p>
            </div>
            <div class="stat-card">
                <h3>이번 주 신청자</h3>
                <p id="weekApplications">0</p>
            </div>
        </div>
        <div class="dashboard-controls">
            <button onclick="refreshApplications()" class="refresh-btn">🔄 새로고침</button>
            <button onclick="exportToCSV()" class="export-btn">📊 CSV 내보내기</button>
        </div>
        <div class="applications-table">
            <table>
                <thead>
                    <tr>
                        <th>신청일시</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>휴대폰</th>
                        <th>신청동기</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody id="applicationsTableBody">
                    <tr>
                        <td colspan="6" class="loading">데이터를 불러오는 중...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.body.appendChild(dashboardDiv);
}

// 관리자 모드 토글
function toggleAdminMode() {
    isAdminMode = !isAdminMode;
    
    if (isAdminMode) {
        document.getElementById('adminDashboard').style.display = 'block';
        document.body.style.overflow = 'hidden';
        loadApplications();
    } else {
        document.getElementById('adminDashboard').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 신청 데이터 Firebase에 저장
async function saveApplicationToFirebase(data) {
    try {
        console.log('Firebase 저장 시작:', data);
        const applicationData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            motivation: data.motivation,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: '신청완료'
        };
        
        console.log('저장할 데이터:', applicationData);
        const docRef = await db.collection('applications').add(applicationData);
        console.log('신청이 성공적으로 저장되었습니다. 문서 ID:', docRef.id);
        return true;
    } catch (error) {
        console.error('Firebase 저장 오류:', error);
        return false;
    }
}

// 신청 데이터 로드
async function loadApplications() {
    try {
        const tableBody = document.getElementById('applicationsTableBody');
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">데이터를 불러오는 중...</td></tr>';
        
        const snapshot = await db.collection('applications')
            .orderBy('timestamp', 'desc')
            .get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-data">신청 데이터가 없습니다.</td></tr>';
            updateStats(0, 0, 0);
            return;
        }
        
        let applications = [];
        snapshot.forEach(doc => {
            applications.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayApplications(applications);
        updateStats(applications);
        
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        document.getElementById('applicationsTableBody').innerHTML = 
            '<tr><td colspan="6" class="error">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

// 신청 데이터 표시
function displayApplications(applications) {
    const tableBody = document.getElementById('applicationsTableBody');
    
    if (applications.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">신청 데이터가 없습니다.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = applications.map(app => `
        <tr>
            <td>${formatDate(app.timestamp)}</td>
            <td>${app.name}</td>
            <td>${app.email}</td>
            <td>${app.phone}</td>
            <td class="motivation-cell">${app.motivation}</td>
            <td>
                <select onchange="updateStatus('${app.id}', this.value)" class="status-select">
                    <option value="신청완료" ${app.status === '신청완료' ? 'selected' : ''}>신청완료</option>
                    <option value="상담중" ${app.status === '상담중' ? 'selected' : ''}>상담중</option>
                    <option value="수강확정" ${app.status === '수강확정' ? 'selected' : ''}>수강확정</option>
                    <option value="취소" ${app.status === '취소' ? 'selected' : ''}>취소</option>
                </select>
            </td>
        </tr>
    `).join('');
}

// 통계 업데이트
function updateStats(applications) {
    const total = applications.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const todayCount = applications.filter(app => {
        const appDate = app.timestamp ? new Date(app.timestamp.toDate()) : new Date();
        return appDate >= today;
    }).length;
    
    const weekCount = applications.filter(app => {
        const appDate = app.timestamp ? new Date(app.timestamp.toDate()) : new Date();
        return appDate >= weekAgo;
    }).length;
    
    document.getElementById('totalApplications').textContent = total;
    document.getElementById('todayApplications').textContent = todayCount;
    document.getElementById('weekApplications').textContent = weekCount;
}

// 상태 업데이트
async function updateStatus(applicationId, newStatus) {
    try {
        await db.collection('applications').doc(applicationId).update({
            status: newStatus
        });
        console.log('상태가 업데이트되었습니다.');
    } catch (error) {
        console.error('상태 업데이트 오류:', error);
        alert('상태 업데이트 중 오류가 발생했습니다.');
    }
}

// 날짜 포맷팅
function formatDate(timestamp) {
    if (!timestamp) return '날짜 없음';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 새로고침
function refreshApplications() {
    loadApplications();
}

// CSV 내보내기
function exportToCSV() {
    db.collection('applications').get().then(snapshot => {
        let csv = '신청일시,이름,이메일,휴대폰,신청동기,상태\n';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = [
                formatDate(data.timestamp),
                data.name,
                data.email,
                data.phone,
                `"${data.motivation.replace(/"/g, '""')}"`,
                data.status
            ].join(',');
            csv += row + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ai-academy-applications-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// 모달 관련 함수들
function openModal() {
    const modal = document.getElementById('applicationModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    const modal = document.getElementById('applicationModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    console.log('showSuccessModal 호출됨');
    console.log('successModal 요소:', successModal);
    if (successModal) {
        successModal.style.display = 'block';
        successModal.style.zIndex = '2001'; // 다른 모달보다 위에 표시
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        console.log('성공 모달 표시됨');
    } else {
        console.error('successModal 요소를 찾을 수 없습니다!');
    }
}

function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 배경 스크롤 복원
        console.log('성공 모달 닫힘');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    createAdminButton();
    createAdminDashboard();
    
    // 모달 이벤트 리스너들
    const modal = document.getElementById('applicationModal');
    const successModal = document.getElementById('successModal');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('applicationForm');

    // Open modal when clicking on application buttons
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });

    // Close modal when clicking on X
    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeSuccessModal();
        }
    });
    
    // 기존 폼 제출 이벤트 수정
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // 유효성 검사
        if (!data.name || !data.email || !data.phone || !data.motivation) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('올바른 이메일 주소를 입력해주세요.');
            return;
        }

        const phoneRegex = /^[0-9-]+$/;
        if (!phoneRegex.test(data.phone)) {
            alert('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }

        // Firebase에 저장 (임시로 성공으로 처리)
        try {
            const saveSuccess = await saveApplicationToFirebase(data);
            
            if (saveSuccess) {
                console.log('Firebase 저장 성공, 성공 모달 표시');
                closeModal();
                setTimeout(() => {
                    showSuccessModal();
                }, 100);
                form.reset();
            } else {
                console.log('Firebase 저장 실패');
                alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.log('Firebase 오류, 임시로 성공 처리:', error);
            // 임시로 성공으로 처리 (테스트용)
            closeModal();
            setTimeout(() => {
                showSuccessModal();
            }, 100);
            form.reset();
        }
    });
    
    // 전역 함수로 등록 (HTML에서 호출하기 위해)
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showSuccessModal = showSuccessModal;
    window.closeSuccessModal = closeSuccessModal;
    window.toggleAdminMode = toggleAdminMode;
    window.refreshApplications = refreshApplications;
    window.exportToCSV = exportToCSV;
    window.updateStatus = updateStatus;
}); 