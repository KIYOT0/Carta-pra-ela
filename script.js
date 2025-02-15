$(document).ready(function() {
    const envelope = $('#envelope');
    const btn_open = $("#open");
    const btn_reset = $("#reset");
    const letter = $("#draggable-letter");
    const letterContent = $(".letter-content");

    let isDragging = false;
    let startY;
    let scrollTop;
    let maxScroll;
    let lastY;
    let velocity = 0;
    let lastTime;
    let rafId;

    function updateMaxScroll() {
        maxScroll = letterContent.height() - letter.height();
        if (maxScroll < 0) maxScroll = 0;
    }

    function animateScroll() {
        if (!isDragging && Math.abs(velocity) > 0.1) {
            const newTop = parseInt(letterContent.css('top')) + velocity * 16;
            velocity *= 0.95;

            if (newTop > 0) {
                letterContent.css('top', '0');
                velocity = 0;
            } else if (newTop < -maxScroll) {
                letterContent.css('top', -maxScroll + 'px');
                velocity = 0;
            } else {
                letterContent.css('top', newTop + 'px');
                rafId = requestAnimationFrame(animateScroll);
            }
        }
    }

    setTimeout(updateMaxScroll, 100);

    function open() {
        envelope.addClass("open").removeClass("close");
    }

    function close() {
        envelope.addClass("close").removeClass("open");
        letterContent.css('top', '0');
    }

    envelope.on('click touchend', function(e) {
        if (!isDragging) {
            open();
        }
        e.preventDefault();
    });

    btn_open.click(open);
    btn_reset.click(close);

    letter.on('mousedown touchstart', function(e) {
        isDragging = true;
        letter.addClass('dragging');
        letterContent.addClass('dragging');

        const touch = e.type === 'touchstart' ? e.touches[0] : e;
        startY = touch.pageY;
        lastY = startY;
        lastTime = Date.now();
        velocity = 0;

        scrollTop = parseInt(letterContent.css('top')) || 0;
        cancelAnimationFrame(rafId);

        e.preventDefault();
    });

    $(document).on('mousemove touchmove', function(e) {
        if (!isDragging) return;

        const touch = e.type === 'touchmove' ? e.touches[0] : e;
        const currentY = touch.pageY;
        const currentTime = Date.now();

        const deltaY = currentY - lastY;
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
            velocity = deltaY / deltaTime;
        }

        const diff = startY - currentY;
        let newTop = scrollTop - diff;

        if (newTop > 0) {
            newTop = newTop * 0.2;
        } else if (newTop < -maxScroll) {
            const overScroll = -(newTop + maxScroll);
            newTop = -maxScroll - (overScroll * 0.2);
        }

        letterContent.css('top', newTop + 'px');

        lastY = currentY;
        lastTime = currentTime;

        e.preventDefault();
    });

    $(document).on('mouseup touchend', function() {
        if (!isDragging) return;

        isDragging = false;
        letter.removeClass('dragging');
        letterContent.removeClass('dragging');

        requestAnimationFrame(animateScroll);
    });

    $(window).on('resize', updateMaxScroll);
});