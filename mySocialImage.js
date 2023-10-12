
class Comment {
    constructor(text, userName, level = 0, parentId = null) {
        // Comment class to represent individual comments
        this.text = text;
        this.userName = userName;
        this.level = level;
        this.likes = 0;
        this.timestamp = Date.now();
        this.id = Math.random().toString(36).substring(2, 15);
        this.parentId = parentId;
    }
}

class Image {
    constructor() {
        // Image class to represent the main image
        this.likes = 0;
    }

    incrementLikes() {
        this.likes += 1;
    }

    getLikes() {
        return this.likes;
    }
}

const currentUserId = document.getElementById('user-id').textContent;
const image = new Image();
const comments = [];

const imageLikeButton = document.querySelector('#image-container .like-button');
const imageCommentButton = document.querySelector('#image-container .comment-button');
const postCommentButton = document.getElementById('post-comment-button');
const commentBox = document.getElementById('comment-box');
const commentsDiv = document.getElementById('comments');
const currentDateSpan = document.getElementById('current-date');
const imageLikeCounter = document.querySelector('#image-container .like-counter');

function formatDate(date) {
    // Function to format the date
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yy} ${mm} ${dd} ${hh}:${min}`;
}

function saveState() {
    // Function to save the state of the application in local storage
    const state = {
        imageLikes: image.getLikes(),
        comments: comments.map(comment => ({
            text: comment.text,
            userName: comment.userName, // Corrected from userId to userName
            level: comment.level,
            likes: comment.likes,
            timestamp: comment.timestamp,
            id: comment.id,
            parentId: comment.parentId
        }))
    };
    localStorage.setItem('imageCommentingState', JSON.stringify(state));
}


function loadState() {
    // Function to load the state of the application from local storage
    const stateJSON = localStorage.getItem('imageCommentingState');
    if (stateJSON) {
        const state = JSON.parse(stateJSON);
        image.likes = state.imageLikes || 0;
        imageLikeCounter.textContent = image.getLikes().toString();

        (state.comments || []).forEach(commentData => {
            const comment = new Comment(
                commentData.text,
                commentData.userName, // Corrected from userId to userName
                commentData.level,
                commentData.parentId
            );
            comment.likes = commentData.likes;
            comment.timestamp = commentData.timestamp;
            comment.id = commentData.id;
            comments.push(comment);
            addComment(commentsDiv, comment);
        });
    }
}


function addComment(parentDiv, comment) {
    // Function to add a comment or sub-comment
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'comment-wrapper';

    const commentDiv = document.createElement('div');
    commentDiv.className = comment.level === 0 ? 'comment' : 'sub-comment';
    commentDiv.setAttribute('data-comment-id', comment.id);

    if (comment.level > 0) {
        const subCommentLine = document.createElement('div');
        subCommentLine.className = 'sub-comment-line';
        commentDiv.appendChild(subCommentLine);
    }

    const commentHeader = document.createElement('div');
    commentHeader.className = 'comment-header';
    commentHeader.innerHTML = `<span>${formatDate(new Date(comment.timestamp))} ago ${comment.userName} said</span>`;    
    commentDiv.appendChild(commentHeader);

    const commentActions = document.createElement('div');
    commentActions.className = 'comment-actions';

    // Like Counter
    const likeCounter = document.createElement('span');
    likeCounter.className = 'like-counter';
    likeCounter.textContent = comment.likes.toString();
    commentActions.appendChild(likeCounter);

    // Like Button
    const likeButton = document.createElement('button');
    likeButton.className = 'like-button';
    likeButton.textContent = '❤️';
    likeButton.title = "Like";
    likeButton.addEventListener('click', () => {
        comment.likes += 1;
        likeCounter.textContent = comment.likes.toString();
        saveState();
    });
    commentActions.appendChild(likeButton);

    // Comment Button
    const commentButton = document.createElement('button');
    commentButton.className = 'comment-button';
    commentButton.textContent = '🗨️';
    commentButton.title = "Comment";
    commentButton.addEventListener('click', () => {
        const replyText = prompt('Enter your comment:');
        if (replyText) {
            const replyComment = new Comment(replyText, currentUserId, comment.level + 1, comment.id);
            addComment(wrapperDiv, replyComment);
            comments.push(replyComment);
            saveState();
        }
    });
    commentActions.appendChild(commentButton);

    commentHeader.appendChild(commentActions);

    const commentContentDiv = document.createElement('div');
    commentContentDiv.className = 'comment-content';
    commentDiv.appendChild(commentContentDiv);

    const commentText = document.createElement('p');
    commentText.textContent = comment.text;
    commentContentDiv.appendChild(commentText);

    // Expand and Contract Buttons
    const expandContractDiv = document.createElement('div');
    expandContractDiv.className = 'expand-contract';

    // Expand Button
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = '⬇️';
    expandButton.addEventListener('click', () => {
        commentText.style.whiteSpace = 'normal';
        commentText.style.overflow = 'visible';
        commentText.style.height = 'auto';
    });
    expandContractDiv.appendChild(expandButton);

    // Contract Button
    const contractButton = document.createElement('button');
    contractButton.className = 'contract-button';
    contractButton.textContent = '⬆️';
    contractButton.addEventListener('click', () => {
        commentText.style.whiteSpace = 'nowrap';
        commentText.style.overflow = 'hidden';
        commentText.style.height = '1em';
    });
    expandContractDiv.appendChild(contractButton);

    commentContentDiv.appendChild(expandContractDiv);

    wrapperDiv.appendChild(commentDiv);

    const subCommentsDiv = document.createElement('div');
    subCommentsDiv.className = 'sub-comments';
    wrapperDiv.appendChild(subCommentsDiv);

    if (comment.level === 0) {
        parentDiv.prepend(wrapperDiv);
    } else {
        const parentCommentWrapper = parentDiv.querySelector(`div[data-comment-id="${comment.parentId}"]`).closest('.comment-wrapper');
        parentCommentWrapper.querySelector('.sub-comments').appendChild(wrapperDiv);
    }

    const recallTimer = setTimeout(() => {
        commentDiv.removeAttribute('data-recallable');
    }, 30000); // 30 seconds

    commentDiv.setAttribute('data-recallable', 'true');

    commentDiv.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (commentDiv.getAttribute('data-recallable') === 'true') {
            if (confirm('Do you want to delete this comment?')) {
                commentDiv.closest('.comment-wrapper').remove();
                const commentIndex = comments.findIndex(c => c.id === comment.id);
                comments.splice(commentIndex, 1);
                clearTimeout(recallTimer); // Clear the timer if the comment is recalled
                saveState();
            }
        }
    });

    return wrapperDiv;
    
}

imageLikeButton.addEventListener('click', () => {
    // Event listener to handle image like button click
    image.incrementLikes();
    imageLikeCounter.textContent = image.getLikes().toString();
    saveState();
});

imageCommentButton.addEventListener('click', () => {
    // Event listener to handle image comment button click
    const commentText = prompt('Enter your comment:');
    if (commentText) {
        const comment = new Comment(commentText, currentUserId, 0);
        addComment(commentsDiv, comment);
        comments.push(comment);
        saveState();
    }
});

postCommentButton.addEventListener('click', () => {
    // Event listener to handle post comment button click
    const commentText = commentBox.value;
    if (commentText) {
        const comment = new Comment(commentText, currentUserId, 0);
        addComment(commentsDiv, comment);
        comments.push(comment);
        commentBox.value = '';
        saveState();
    }
});

function updateDate() {
    // Function to update the date every minute
    const date = new Date();
    currentDateSpan.textContent = formatDate(date);
    setTimeout(updateDate, 60000);
}

updateDate(); // Start the date update function

loadState(); // Load state when page is loaded

// Check if there are no comments (fresh state)
if (comments.length === 0) {
    // Adding the first dummy comment about the image
    const firstDummyComment = new Comment("Think I burned the D and scored?", "Connor McDavid", 0);
    const firstCommentWrapper = addComment(commentsDiv, firstDummyComment);
    comments.push(firstDummyComment);

    // Adding the second dummy comment as a reply to the first comment
    const secondDummyComment = new Comment("Unfortunately, I remember you doing just that", "Ian Cole", 1, firstDummyComment.id);
    addComment(firstCommentWrapper, secondDummyComment); // Use firstCommentWrapper directly
    comments.push(secondDummyComment);

    // Save the state with the dummy comments
    saveState();
}
