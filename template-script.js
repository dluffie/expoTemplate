/* ── CSS vars ── */
function sv(n, v) { document.documentElement.style.setProperty(n, v) }
function svpx(n, v) { document.documentElement.style.setProperty(n, v + 'px') }
function qall(s, p, v) { document.querySelectorAll(s).forEach(e => e.style[p] = v) }

/* ── Waterfall layout engine ── */
function layoutSections() {
    const body = document.querySelector('.body')
    if (!body) return
    const sections = [...body.querySelectorAll('.section')]
    const addRow = body.querySelector('.add-sec-row')
    const pad = 14 // body padding
    const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-gap')) || 12
    const containerW = body.clientWidth - pad * 2
    const colW = (containerW - gap) / 2
    const colHeights = [0, 0]

    sections.forEach(sec => {
        const isFull = sec.classList.contains('sec-full')
        // Temporarily make section visible but measured
        sec.style.visibility = 'hidden'
        sec.style.display = 'flex'

        if (isFull) {
            const top = Math.max(colHeights[0], colHeights[1])
            sec.style.left = pad + 'px'
            sec.style.top = (pad + top) + 'px'
            sec.style.width = containerW + 'px'
            sec.style.visibility = ''
            // Measure after setting width
            const h = sec.offsetHeight
            colHeights[0] = top + h + gap
            colHeights[1] = top + h + gap
        } else {
            // Place in shorter column
            const col = colHeights[0] <= colHeights[1] ? 0 : 1
            const left = pad + col * (colW + gap)
            const top = colHeights[col]
            sec.style.left = left + 'px'
            sec.style.top = (pad + top) + 'px'
            // Use custom width if set by resize, otherwise use column width
            if (!sec.dataset.customWidth) {
                sec.style.width = colW + 'px'
            }
            sec.style.visibility = ''
            const h = sec.offsetHeight
            colHeights[col] = top + h + gap
        }
    })

    const maxH = Math.max(colHeights[0], colHeights[1])
    // Position add-section row
    if (addRow) {
        addRow.style.top = (pad + maxH) + 'px'
        addRow.style.left = '0'
        addRow.style.right = '0'
    }
    // Set container height
    body.style.minHeight = (pad + maxH + (addRow ? 50 : 0) + pad) + 'px'
}

let layoutTimer = null
function scheduleLayout() {
    cancelAnimationFrame(layoutTimer)
    layoutTimer = requestAnimationFrame(layoutSections)
}
window.addEventListener('resize', scheduleLayout)

/* ── Menu toggle ── */
function toggleMenu(id) {
    const item = document.getElementById(id)
    const wasOpen = item.classList.contains('open')
    document.querySelectorAll('.mb-item').forEach(el => el.classList.remove('open'))
    if (!wasOpen) item.classList.add('open')
}
document.addEventListener('click', e => {
    if (!e.target.closest('.mb-item')) {
        document.querySelectorAll('.mb-item').forEach(el => el.classList.remove('open'))
    }
})

/* ── Themes ── */
const themes = {
    navy: { hdr1: '#1a2744', hdr2: '#2c4a8c', gold: '#c8973a', badge: '#e07b3a', tag1: '#e8a96a', tag2: '#c8793a', page: '#fdf8f0', border: '#2c4a8c' },
    green: { hdr1: '#0d3b2e', hdr2: '#1a7a55', gold: '#f0c040', badge: '#2d8a4e', tag1: '#5dbf85', tag2: '#1a7a55', page: '#f5fdf8', border: '#1a7a55' },
    purple: { hdr1: '#2d1b4e', hdr2: '#6a3d9a', gold: '#e0b0ff', badge: '#9c4dcc', tag1: '#b07de8', tag2: '#6a3d9a', page: '#fbf8ff', border: '#6a3d9a' },
    black: { hdr1: '#111111', hdr2: '#333333', gold: '#ffcc00', badge: '#555555', tag1: '#666666', tag2: '#333333', page: '#f5f5f5', border: '#333333' },
    red: { hdr1: '#7b1a1a', hdr2: '#c0392b', gold: '#f39c12', badge: '#e74c3c', tag1: '#e88a6a', tag2: '#c0392b', page: '#fff8f8', border: '#c0392b' },
    sky: { hdr1: '#1a3a5c', hdr2: '#2980b9', gold: '#f1c40f', badge: '#1abc9c', tag1: '#5dade2', tag2: '#2980b9', page: '#f5faff', border: '#2980b9' },
}
function applyTheme(t) {
    const th = themes[t]
    sv('--hdr1', th.hdr1); sv('--hdr2', th.hdr2); sv('--gold', th.gold)
    sv('--badge-bg', th.badge); sv('--tag1', th.tag1); sv('--tag2', th.tag2)
    sv('--page-bg', th.page); sv('--card-border', th.border)
    document.querySelectorAll('input[type=color]').forEach(c => {
        const oi = c.getAttribute('oninput') || ''
        if (oi.includes('--hdr1')) c.value = th.hdr1
        if (oi.includes('--hdr2')) c.value = th.hdr2
        if (oi.includes('--gold')) c.value = th.gold
        if (oi.includes('--badge-bg')) c.value = th.badge
        if (oi.includes('--tag1')) c.value = th.tag1
        if (oi.includes('--tag2')) c.value = th.tag2
        if (oi.includes('--page-bg')) c.value = th.page
        if (oi.includes('--card-border')) c.value = th.border
    })
}

/* ── Clear / Reset ── */
function clearText() {
    if (!confirm('Clear all text? This cannot be undone.')) return
    document.querySelectorAll('[contenteditable]').forEach(el => el.innerHTML = '')
}
function resetAll() {
    if (!confirm('Reset all design changes to defaults?')) return
    document.documentElement.removeAttribute('style')
    document.querySelectorAll('.stag,.scont').forEach(el => {
        el.style.fontSize = ''; el.style.fontFamily = ''; el.style.lineHeight = ''
    })
    document.querySelectorAll('input[type=range]').forEach(r => {
        r.value = r.defaultValue
        const rv = r.nextElementSibling
        if (rv && rv.classList.contains('rv')) rv.textContent = r.defaultValue + (parseFloat(r.step) < 1 ? '' : 'px')
    })
    document.querySelectorAll('input[type=color]').forEach(c => c.value = c.defaultValue)
}

/* ── Export helpers ── */
function showOverlay(icon, msg, sub) {
    document.getElementById('exp-icon').textContent = icon
    document.getElementById('exp-msg').textContent = msg
    document.getElementById('exp-sub').textContent = sub
    document.getElementById('exportOverlay').classList.add('show')
}
function hideOverlay() { document.getElementById('exportOverlay').classList.remove('show') }

async function captureCanvas(scale) {
    const page = document.querySelector('.page')
    const orig = { shadow: page.style.boxShadow, radius: page.style.borderRadius }
    page.style.boxShadow = 'none'; page.style.borderRadius = '0'

    // Sections use absolute positioning — widths are already correct, no clearing needed

    // Hide all UI controls
    const uiEls = document.querySelectorAll('.sec-del,.sec-drag,.sec-width,.sec-resize-r,.sec-resize-b,.sec-resize-br,.dia-copy,.ms-del,.ms-handle,.shape-toolbar,.ci-handle,.ci-del,.add-sec-row')
    uiEls.forEach(el => el.style.display = 'none')

    // Clean canvas images for capture
    const canvasImgs = document.querySelectorAll('.canvas-img')
    canvasImgs.forEach(ci => { ci.style.border = 'none'; ci.style.boxShadow = 'none' })
    document.querySelectorAll('.ci-selected').forEach(el => el.classList.remove('ci-selected'))
    document.querySelectorAll('.ms-sel').forEach(el => el.classList.remove('ms-sel'))

    await new Promise(r => setTimeout(r, 300))

    const canvas = await html2canvas(page, {
        scale, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
        windowWidth: page.scrollWidth, windowHeight: page.scrollHeight
    })

    // Restore everything
    page.style.boxShadow = orig.shadow; page.style.borderRadius = orig.radius
    canvasImgs.forEach(ci => { ci.style.border = ''; ci.style.boxShadow = '' })
    uiEls.forEach(el => el.style.display = '')

    return canvas
}

async function savePNG() {
    showOverlay('🖼️', 'Saving PNG…', 'Rendering at 2× resolution')
    const mb = document.getElementById('menubar'), h = document.querySelector('.hint'), fb = document.getElementById('floatBar')
    mb.style.display = 'none'; h.style.display = 'none'; fb.style.display = 'none'
    window.getSelection()?.removeAllRanges()
    await new Promise(r => setTimeout(r, 200))
    try {
        const canvas = await captureCanvas(2)
        const a = document.createElement('a'); a.download = 'project-expo-poster.png'; a.href = canvas.toDataURL('image/png'); a.click()
        showOverlay('✅', 'PNG Saved!', 'Check your downloads folder'); setTimeout(hideOverlay, 2000)
    } catch (err) { showOverlay('❌', 'Export failed', err.message); setTimeout(hideOverlay, 3000) }
    finally { mb.style.display = ''; h.style.display = '' }
}

async function savePDF() {
    showOverlay('📄', 'Building PDF…', 'Rendering A4 page')
    const mb = document.getElementById('menubar'), h = document.querySelector('.hint'), fb = document.getElementById('floatBar')
    mb.style.display = 'none'; h.style.display = 'none'; fb.style.display = 'none'
    window.getSelection()?.removeAllRanges()
    await new Promise(r => setTimeout(r, 200))
    try {
        const canvas = await captureCanvas(2)
        const { jsPDF } = window.jspdf
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const pw = pdf.internal.pageSize.getWidth(), ph2 = pdf.internal.pageSize.getHeight()
        const imgData = canvas.toDataURL('image/jpeg', 0.97), ratio = canvas.height / canvas.width, imgH = pw * ratio
        if (imgH <= ph2) pdf.addImage(imgData, 'JPEG', 0, 0, pw, imgH)
        else { const imgW = ph2 / ratio; pdf.addImage(imgData, 'JPEG', (pw - imgW) / 2, 0, imgW, ph2) }
        pdf.save('project-expo-poster.pdf')
        showOverlay('✅', 'PDF Saved!', 'Check your downloads folder'); setTimeout(hideOverlay, 2000)
    } catch (err) { showOverlay('❌', 'Export failed', err.message); setTimeout(hideOverlay, 3000) }
    finally { mb.style.display = ''; h.style.display = '' }
}

async function exportForCanva() {
    showOverlay('🎨', 'Preparing for Canva…', 'Exporting high-res image')
    const mb = document.getElementById('menubar'), h = document.querySelector('.hint'), fb = document.getElementById('floatBar')
    mb.style.display = 'none'; h.style.display = 'none'; fb.style.display = 'none'
    window.getSelection()?.removeAllRanges()
    await new Promise(r => setTimeout(r, 200))
    try {
        const canvas = await captureCanvas(3)
        const a = document.createElement('a')
        a.download = 'project-expo-canva.png'
        a.href = canvas.toDataURL('image/png')
        a.click()
        showOverlay('✅', 'Canva-Ready PNG Saved!', 'Opening Canva editor…')
        setTimeout(() => {
            window.open('https://www.canva.com/design/create/custom-size?width=2382&height=3368&unit=px', '_blank')
            hideOverlay()
        }, 1500)
    } catch (err) { showOverlay('❌', 'Export failed', err.message); setTimeout(hideOverlay, 3000) }
    finally { mb.style.display = ''; h.style.display = '' }
}

/* ── Floating text toolbar ── */
const bar = document.getElementById('floatBar')
let ht = null
function placeBar(cx, top) {
    clearTimeout(ht); bar.style.display = 'flex'
    let left = Math.max(8, Math.min(cx - 210, window.innerWidth - 428))
    let t = top - 52; if (t < 54) t = top + 26
    bar.style.left = left + 'px'; bar.style.top = t + 'px'
}
function schedHide() { ht = setTimeout(() => bar.style.display = 'none', 250) }
document.addEventListener('mouseup', e => {
    if (bar.contains(e.target)) return
    setTimeout(() => {
        const s = window.getSelection()
        if (s && s.toString().trim()) {
            const rc = s.getRangeAt(0).getBoundingClientRect()
            placeBar(rc.left + rc.width / 2 + window.scrollX, rc.top + window.scrollY)
        } else schedHide()
    }, 15)
})
document.addEventListener('keyup', () => {
    const s = window.getSelection()
    if (s && s.toString().trim()) {
        const rc = s.getRangeAt(0).getBoundingClientRect()
        placeBar(rc.left + rc.width / 2 + window.scrollX, rc.top + window.scrollY)
    } else schedHide()
})
bar.addEventListener('mouseenter', () => clearTimeout(ht))
bar.addEventListener('mouseleave', schedHide)
function fmt(cmd, val) { document.execCommand(cmd, false, val || null) }

/* ── Tab key ── */
document.addEventListener('keydown', e => {
    if (e.key === 'Tab' && document.activeElement?.isContentEditable) {
        e.preventDefault(); document.execCommand('insertText', false, '    ')
    }
})

/* ══════════════════════════════════════
   SECTION MANAGEMENT
══════════════════════════════════════ */
function removeSection(btn) {
    const sec = btn.closest('.section')
    if (sec && confirm('Remove this section?')) { sec.remove(); layoutSections() }
}

function toggleSectionWidth(btn) {
    const sec = btn.closest('.section')
    if (!sec) return
    sec.classList.toggle('sec-full')
    // Clear custom width when toggling
    delete sec.dataset.customWidth
    sec.style.width = ''
    // Update button icon
    btn.textContent = sec.classList.contains('sec-full') ? '↔' : '⇔'
    btn.title = sec.classList.contains('sec-full') ? 'Half width' : 'Full width'
    layoutSections()
}

function addTextSection() {
    const body = document.querySelector('.body'), addRow = body.querySelector('.add-sec-row')
    const sec = document.createElement('div')
    sec.className = 'section'
    sec.innerHTML =
        '<button class="sec-drag" title="Drag to reorder">⠿</button>' +
        '<button class="sec-width" title="Full width" onclick="toggleSectionWidth(this)">⇔</button>' +
        '<button class="sec-del" onclick="removeSection(this)" title="Remove section">✕</button>' +
        '<div class="stag" contenteditable="true"><span class="icon">📝</span>&nbsp;New Section</div>' +
        '<div class="scont" contenteditable="true" data-placeholder="Click to add content…"></div>'
    body.insertBefore(sec, addRow)
    injectResizeHandles(sec)
    initSectionDrag(sec)
    layoutSections()
}

function addImageSection() {
    const body = document.querySelector('.body'), addRow = body.querySelector('.add-sec-row')
    const sec = document.createElement('div')
    sec.className = 'section'
    sec.innerHTML =
        '<button class="sec-drag" title="Drag to reorder">⠿</button>' +
        '<button class="sec-width" title="Full width" onclick="toggleSectionWidth(this)">⇔</button>' +
        '<button class="sec-del" onclick="removeSection(this)" title="Remove section">✕</button>' +
        '<div class="stag" contenteditable="true"><span class="icon">🖼️</span>&nbsp;Image</div>' +
        '<div class="diagram-box" style="min-height:120px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fafbfe" onclick="triggerImageUpload(this)">' +
        '<div class="img-placeholder" style="text-align:center;color:#aaa;font-size:11px;pointer-events:none">' +
        '<div style="font-size:28px;margin-bottom:4px">📷</div>' +
        'Click to upload image<br><span style="font-size:9px;color:#ccc">or drag an image file here</span>' +
        '</div>' +
        '</div>'
    body.insertBefore(sec, addRow)
    injectResizeHandles(sec)
    initSectionDrag(sec)
    setupImageDrop(sec.querySelector('.diagram-box'))
    injectShapeToolbars()
    layoutSections()
}

function addDiagramSection() {
    const body = document.querySelector('.body'), addRow = body.querySelector('.add-sec-row')
    const sec = document.createElement('div')
    sec.className = 'section'
    sec.innerHTML =
        '<button class="sec-drag" title="Drag to reorder">⠿</button>' +
        '<button class="sec-width" title="Full width" onclick="toggleSectionWidth(this)">⇔</button>' +
        '<button class="sec-del" onclick="removeSection(this)" title="Remove section">✕</button>' +
        '<div class="stag" contenteditable="true"><span class="icon">📊</span>&nbsp;Diagram</div>' +
        '<div class="diagram-box" style="min-height:140px;background:#fafbfe;background-image:radial-gradient(circle,#dde 1px,transparent 1px);background-size:14px 14px"></div>'
    body.insertBefore(sec, addRow)
    injectResizeHandles(sec)
    initSectionDrag(sec)
    injectShapeToolbars()
    layoutSections()
}

/* ── Image upload helpers ── */
function triggerImageUpload(box) {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = 'image/*'
    inp.onchange = function () { if (this.files[0]) loadImageIntoBox(box, this.files[0]) }
    inp.click()
}

function loadImageIntoBox(box, file) {
    const reader = new FileReader()
    reader.onload = function (e) {
        const ph = box.querySelector('.img-placeholder')
        if (ph) ph.remove()
        box.removeAttribute('onclick')
        box.style.cursor = 'default'
        box.style.display = ''
        // Create a resizable image container
        const wrap = document.createElement('div')
        wrap.className = 'mini-shape'
        wrap.style.cssText = 'position:relative;left:5px;top:5px;width:200px;height:150px;border:none;background:transparent;padding:0;border-radius:4px;overflow:hidden'
        wrap.innerHTML =
            '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:contain;display:block;pointer-events:none">' +
            '<div class="ms-handle se"></div>' +
            '<button class="ms-del" onclick="event.stopPropagation();this.parentElement.remove();selMini=null">✕</button>'
        box.appendChild(wrap)
        selectMini(wrap)
    }
    reader.readAsDataURL(file)
}

function addImageToBox(box) {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = 'image/*'
    inp.onchange = function () {
        if (!this.files[0]) return
        const reader = new FileReader()
        reader.onload = function (ev) {
            const wrap = document.createElement('div')
            wrap.className = 'mini-shape'
            wrap.style.cssText = 'position:absolute;left:10px;top:10px;width:80px;height:60px;border:1.5px solid #ccc;background:transparent;padding:0;border-radius:4px;overflow:hidden'
            wrap.innerHTML =
                '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none">' +
                '<div class="ms-handle se"></div>' +
                '<button class="ms-del" onclick="event.stopPropagation();this.parentElement.remove();selMini=null">✕</button>'
            box.appendChild(wrap)
            selectMini(wrap)
        }
        reader.readAsDataURL(this.files[0])
    }
    inp.click()
}

function setupImageDrop(box) {
    box.addEventListener('dragover', function (e) {
        e.preventDefault(); box.style.outline = '2px dashed var(--gold)'
    })
    box.addEventListener('dragleave', function () { box.style.outline = '' })
    box.addEventListener('drop', function (e) {
        e.preventDefault(); box.style.outline = ''
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) loadImageIntoBox(box, file)
    })
}

/* ══════════════════════════════════════
   SECTION DRAG TO REORDER
══════════════════════════════════════ */
let draggedSection = null

function initSectionDrag(sec) {
    const handle = sec.querySelector('.sec-drag')
    if (!handle) return
    handle.addEventListener('mousedown', function (e) {
        e.preventDefault(); draggedSection = sec; sec.classList.add('dragging')
        document.addEventListener('mousemove', onSectionDragMove)
        document.addEventListener('mouseup', onSectionDragEnd)
    })
}

function onSectionDragMove(e) {
    if (!draggedSection) return
    const sections = [...document.querySelector('.body').querySelectorAll('.section:not(.dragging)')]
    sections.forEach(s => s.classList.remove('drag-over'))
    const target = sections.find(s => {
        const r = s.getBoundingClientRect()
        return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom
    })
    if (target) target.classList.add('drag-over')
}

function onSectionDragEnd(e) {
    document.removeEventListener('mousemove', onSectionDragMove)
    document.removeEventListener('mouseup', onSectionDragEnd)
    if (!draggedSection) return
    const body = document.querySelector('.body')
    body.querySelectorAll('.section').forEach(s => s.classList.remove('drag-over'))
    const target = [...body.querySelectorAll('.section')].find(s => {
        if (s === draggedSection) return false
        const r = s.getBoundingClientRect()
        return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom
    })
    if (target) {
        const ph = document.createElement('div')
        body.insertBefore(ph, draggedSection)
        body.insertBefore(draggedSection, target)
        body.insertBefore(target, ph); ph.remove()
    }
    draggedSection.classList.remove('dragging'); draggedSection = null
    layoutSections()
}

/* ══════════════════════════════════════
   EDITABLE SVG TEXT (double-click to edit)
══════════════════════════════════════ */
document.addEventListener('dblclick', function (e) {
    const textEl = e.target.closest('text')
    if (!textEl || !textEl.closest('.diagram-box')) return
    e.preventDefault(); e.stopPropagation()
    const svg = textEl.closest('svg'), box = svg.closest('.diagram-box')
    const svgRect = svg.getBoundingClientRect(), svgVB = svg.viewBox.baseVal
    const scaleX = svgRect.width / svgVB.width, scaleY = svgRect.height / svgVB.height
    const tx = parseFloat(textEl.getAttribute('x')) * scaleX + svgRect.left - box.getBoundingClientRect().left
    const ty = parseFloat(textEl.getAttribute('y')) * scaleY + svgRect.top - box.getBoundingClientRect().top
    const fs = parseFloat(textEl.getAttribute('font-size') || 8) * scaleX
    const input = document.createElement('input')
    input.className = 'svg-edit-input'
    input.value = textEl.textContent
    input.style.left = (tx - 40) + 'px'; input.style.top = (ty - fs - 4) + 'px'
    input.style.fontSize = Math.max(10, fs) + 'px'
    input.style.width = Math.max(80, textEl.textContent.length * fs * 0.7) + 'px'
    box.appendChild(input); input.focus(); input.select()
    function commit() { textEl.textContent = input.value; if (box.contains(input)) box.removeChild(input) }
    input.addEventListener('blur', commit)
    input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); commit() }
        if (ev.key === 'Escape') { if (box.contains(input)) box.removeChild(input) }
    })
})

/* SVG node click-to-color */
document.addEventListener('click', function (e) {
    const node = e.target.closest('.dia-node')
    if (!node || e.detail > 1) return
    const fill = node.getAttribute('fill') || '#dbeafe'
    const inp = document.createElement('input')
    inp.type = 'color'; inp.value = fill.startsWith('#') ? fill : '#dbeafe'
    inp.style.cssText = 'position:fixed;opacity:0;width:0;height:0;top:' + e.clientY + 'px;left:' + e.clientX + 'px'
    document.body.appendChild(inp)
    inp.addEventListener('input', () => node.setAttribute('fill', inp.value))
    inp.addEventListener('change', () => { if (document.body.contains(inp)) document.body.removeChild(inp) })
    inp.addEventListener('blur', () => { if (document.body.contains(inp)) document.body.removeChild(inp) })
    inp.click()
})

/* ══════════════════════════════════════
   MINI MOVABLE SHAPES
══════════════════════════════════════ */
let selMini = null, miniDrag = null, miniResize = null

function addMiniShape(container, type) {
    const shapes = {
        rect: { w: 55, h: 28, br: '3px', bg: '#dbeafe', label: 'Label' },
        circle: { w: 35, h: 35, br: '50%', bg: '#d1fae5', label: '○' },
        diamond: { w: 35, h: 35, br: '3px', bg: '#fef3c7', label: '◇', transform: 'rotate(45deg)' },
        arrow: { w: 40, h: 3, br: '0', bg: '#64748b', label: '' },
        cloud: { w: 55, h: 30, br: '15px', bg: '#ecfdf5', label: 'Cloud' },
        db: { w: 45, h: 30, br: '3px', bg: '#fce7f3', label: 'DB' },
    }
    const s = shapes[type] || shapes.rect
    const el = document.createElement('div')
    el.className = 'mini-shape'
    el.style.cssText = 'position:absolute;left:10px;top:10px;width:' + s.w + 'px;height:' + s.h + 'px;border-radius:' + s.br + ';background:' + s.bg
    if (s.transform) el.style.transform = s.transform
    // For shapes with labels, make a nested editable span (NOT the div itself)
    if (s.label) {
        el.innerHTML = '<span class="ms-label" contenteditable="true" style="outline:none;cursor:text;display:block;width:100%;height:100%;display:flex;align-items:center;justify-content:center">' + s.label + '</span>'
    }
    el.innerHTML += '<div class="ms-handle se"></div><button class="ms-del" onclick="event.stopPropagation();this.parentElement.remove();selMini=null">✕</button>'
    container.appendChild(el)
    selectMini(el)
}

function selectMini(el) {
    if (selMini) selMini.classList.remove('ms-sel')
    selMini = el; el.classList.add('ms-sel')
}

/* ── MOUSEDOWN: Only drag .mini-shape elements, NOT SVGs or other diagram content ── */
document.addEventListener('mousedown', function (e) {
    // Ignore clicks inside SVG (those are for SVG editing/coloring, not dragging)
    if (e.target.closest('svg')) return
    // Ignore if clicking inside the shape toolbar buttons
    if (e.target.closest('.shape-toolbar')) return

    const handle = e.target.closest('.ms-handle')
    const shape = e.target.closest('.mini-shape')

    // Resize handle
    if (handle && shape) {
        e.preventDefault()
        selectMini(shape)
        miniResize = { el: shape, startX: e.clientX, startY: e.clientY, startW: shape.offsetWidth, startH: shape.offsetHeight }
        return
    }

    // Clicked on a mini-shape
    if (shape && !e.target.closest('.ms-del')) {
        // If clicking on the editable label inside the shape, let the cursor work
        const label = e.target.closest('.ms-label')
        if (label && shape.classList.contains('ms-sel')) {
            // Shape is already selected, allow text editing — don't preventDefault
            return
        }
        // Otherwise select and start drag
        selectMini(shape)
        e.preventDefault()
        const cr = shape.parentElement.getBoundingClientRect()
        miniDrag = { el: shape, offX: e.clientX - shape.getBoundingClientRect().left, offY: e.clientY - shape.getBoundingClientRect().top, cr }
        return
    }

    // Clicked on empty space — deselect
    if (!shape && selMini && !e.target.closest('.ms-del')) {
        selMini.classList.remove('ms-sel'); selMini = null
    }
})

document.addEventListener('mousemove', function (e) {
    if (miniResize) {
        const el = miniResize.el
        el.style.width = Math.max(20, miniResize.startW + e.clientX - miniResize.startX) + 'px'
        el.style.height = Math.max(20, miniResize.startH + e.clientY - miniResize.startY) + 'px'
        return
    }
    if (!miniDrag) return
    const { el, offX, offY, cr } = miniDrag
    el.style.left = Math.max(0, Math.min(e.clientX - cr.left - offX, cr.width - el.offsetWidth)) + 'px'
    el.style.top = Math.max(0, Math.min(e.clientY - cr.top - offY, cr.height - el.offsetHeight)) + 'px'
})

document.addEventListener('mouseup', () => { miniDrag = null; miniResize = null })

document.addEventListener('keydown', function (e) {
    // Only delete shape if not actively editing text inside it
    if ((e.key === 'Delete' || e.key === 'Backspace') && selMini && !e.target.closest('.ms-label') && !e.target.closest('[contenteditable]')) {
        selMini.remove(); selMini = null; e.preventDefault()
    }
})

/* ══════════════════════════════════════
   SHAPE TOOLBARS (auto-injected into .diagram-box)
══════════════════════════════════════ */
function injectShapeToolbars() {
    document.querySelectorAll('.diagram-box').forEach(box => {
        if (box.querySelector('.shape-toolbar')) return
        const tb = document.createElement('div')
        tb.className = 'shape-toolbar'
        tb.innerHTML =
            '<button class="st-btn" title="Rectangle" onclick="addMiniShape(this.closest(\'.diagram-box\'),\'rect\')"><svg viewBox="0 0 16 14"><rect x="1" y="2" width="14" height="10" rx="2" fill="#dbeafe" stroke="#2563eb" stroke-width="1"/></svg></button>' +
            '<button class="st-btn" title="Circle" onclick="addMiniShape(this.closest(\'.diagram-box\'),\'circle\')"><svg viewBox="0 0 16 14"><circle cx="8" cy="7" r="5" fill="#d1fae5" stroke="#059669" stroke-width="1"/></svg></button>' +
            '<button class="st-btn" title="Diamond" onclick="addMiniShape(this.closest(\'.diagram-box\'),\'diamond\')"><svg viewBox="0 0 16 14"><rect x="4" y="1" width="8" height="8" rx="1" fill="#fef3c7" stroke="#d97706" stroke-width="1" transform="rotate(45 8 5)"/></svg></button>' +
            '<button class="st-btn" title="Arrow" onclick="addMiniShape(this.closest(\'.diagram-box\'),\'arrow\')"><svg viewBox="0 0 16 14"><line x1="2" y1="7" x2="12" y2="7" stroke="#64748b" stroke-width="1.5"/><polygon points="12,4 16,7 12,10" fill="#64748b"/></svg></button>' +
            '<button class="st-btn" title="Cloud" onclick="addMiniShape(this.closest(\'.diagram-box\'),\'cloud\')"><svg viewBox="0 0 16 14"><ellipse cx="8" cy="8" rx="7" ry="4" fill="#ecfdf5" stroke="#10b981" stroke-width="1"/></svg></button>' +
            '<button class="st-btn" title="Database" onclick="addMiniShape(this.closest(\'.diagram-box\'),\'db\')"><svg viewBox="0 0 16 14"><ellipse cx="8" cy="4" rx="6" ry="2.5" fill="#fce7f3" stroke="#db2777" stroke-width="1"/><path d="M2 4v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V4" fill="none" stroke="#db2777" stroke-width="1"/></svg></button>' +
            '<button class="st-btn" title="Upload Image" onclick="addImageToBox(this.closest(\'.diagram-box\'))"><svg viewBox="0 0 16 14"><rect x="1" y="2" width="14" height="10" rx="1" fill="#f0f9ff" stroke="#0284c7" stroke-width="1"/><circle cx="5" cy="6" r="1.5" fill="#0ea5e9"/><polyline points="1,11 5,7 8,9 11,5 15,9" fill="none" stroke="#0284c7" stroke-width="1"/></svg></button>'
        box.appendChild(tb)
        setupImageDrop(box)
    })
}

/* ══════════════════════════════════════
   CANVAS IMAGES — free-floating on page
══════════════════════════════════════ */
let selCanvas = null, ciDrag = null, ciResize = null

function addCanvasImage() {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = 'image/*'
    inp.onchange = function () {
        if (!this.files[0]) return
        const reader = new FileReader()
        reader.onload = function (ev) {
            const page = document.querySelector('.page')
            const el = document.createElement('div')
            el.className = 'canvas-img'
            el.style.left = '60px'
            el.style.top = '200px'
            el.style.width = '200px'
            el.style.height = '160px'
            el.innerHTML =
                '<img src="' + ev.target.result + '">' +
                '<div class="ci-handle ci-se"></div>' +
                '<div class="ci-handle ci-sw"></div>' +
                '<div class="ci-handle ci-ne"></div>' +
                '<div class="ci-handle ci-nw"></div>' +
                '<button class="ci-del" onclick="event.stopPropagation();this.parentElement.remove();selCanvas=null">✕</button>'
            page.appendChild(el)
            selectCanvas(el)
        }
        reader.readAsDataURL(this.files[0])
    }
    inp.click()
}

function selectCanvas(el) {
    if (selCanvas) selCanvas.classList.remove('ci-selected')
    selCanvas = el
    if (el) el.classList.add('ci-selected')
}

/* ── Canvas image mouse interactions ── */
document.addEventListener('mousedown', function (e) {
    // Resize handle
    const handle = e.target.closest('.ci-handle')
    const ci = e.target.closest('.canvas-img')

    if (handle && ci) {
        e.preventDefault()
        selectCanvas(ci)
        const rect = ci.getBoundingClientRect()
        ciResize = {
            el: ci,
            corner: handle.classList.contains('ci-se') ? 'se' :
                    handle.classList.contains('ci-sw') ? 'sw' :
                    handle.classList.contains('ci-ne') ? 'ne' : 'nw',
            startX: e.clientX, startY: e.clientY,
            startW: ci.offsetWidth, startH: ci.offsetHeight,
            startL: parseInt(ci.style.left) || 0,
            startT: parseInt(ci.style.top) || 0
        }
        return
    }

    // Drag canvas image
    if (ci && !e.target.closest('.ci-del')) {
        e.preventDefault()
        selectCanvas(ci)
        const pageRect = ci.parentElement.getBoundingClientRect()
        ciDrag = {
            el: ci,
            offX: e.clientX - ci.getBoundingClientRect().left,
            offY: e.clientY - ci.getBoundingClientRect().top,
            pr: pageRect
        }
        return
    }

    // Click on empty space — deselect canvas image
    if (!ci && selCanvas && !e.target.closest('.ci-del') && !e.target.closest('.mini-shape') && !e.target.closest('#menubar')) {
        selCanvas.classList.remove('ci-selected')
        selCanvas = null
    }
})

document.addEventListener('mousemove', function (e) {
    if (ciResize) {
        const r = ciResize
        const dx = e.clientX - r.startX
        const dy = e.clientY - r.startY
        if (r.corner === 'se') {
            r.el.style.width = Math.max(40, r.startW + dx) + 'px'
            r.el.style.height = Math.max(40, r.startH + dy) + 'px'
        } else if (r.corner === 'sw') {
            const newW = Math.max(40, r.startW - dx)
            r.el.style.width = newW + 'px'
            r.el.style.left = (r.startL + r.startW - newW) + 'px'
            r.el.style.height = Math.max(40, r.startH + dy) + 'px'
        } else if (r.corner === 'ne') {
            r.el.style.width = Math.max(40, r.startW + dx) + 'px'
            const newH = Math.max(40, r.startH - dy)
            r.el.style.height = newH + 'px'
            r.el.style.top = (r.startT + r.startH - newH) + 'px'
        } else if (r.corner === 'nw') {
            const newW = Math.max(40, r.startW - dx)
            const newH = Math.max(40, r.startH - dy)
            r.el.style.width = newW + 'px'
            r.el.style.height = newH + 'px'
            r.el.style.left = (r.startL + r.startW - newW) + 'px'
            r.el.style.top = (r.startT + r.startH - newH) + 'px'
        }
        return
    }
    if (!ciDrag) return
    const { el, offX, offY, pr } = ciDrag
    const newX = e.clientX - pr.left - offX
    const newY = e.clientY - pr.top - offY
    el.style.left = Math.max(0, Math.min(newX, pr.width - el.offsetWidth)) + 'px'
    el.style.top = Math.max(0, Math.min(newY, pr.height - el.offsetHeight)) + 'px'
})

document.addEventListener('mouseup', function () {
    ciDrag = null; ciResize = null
})

/* Delete canvas image with Delete/Backspace */
document.addEventListener('keydown', function (e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selCanvas && !e.target.closest('[contenteditable]') && !e.target.closest('.ms-label') && !e.target.closest('input') && !e.target.closest('select')) {
        selCanvas.remove(); selCanvas = null; e.preventDefault()
    }
})

/* ══════════════════════════════════════
   SECTION EDGE RESIZE
══════════════════════════════════════ */
let secResize = null

function injectResizeHandles(sec) {
    if (sec.querySelector('.sec-resize-br')) return
    sec.insertAdjacentHTML('beforeend',
        '<div class="sec-resize-r"></div>' +
        '<div class="sec-resize-b"></div>' +
        '<div class="sec-resize-br"></div>'
    )
}

document.addEventListener('mousedown', function (e) {
    const rr = e.target.closest('.sec-resize-r')
    const rb = e.target.closest('.sec-resize-b')
    const rbr = e.target.closest('.sec-resize-br')
    if (!rr && !rb && !rbr) return
    const sec = e.target.closest('.section')
    if (!sec) return
    e.preventDefault()
    secResize = {
        el: sec,
        mode: rbr ? 'both' : rr ? 'width' : 'height',
        startX: e.clientX,
        startY: e.clientY,
        startW: sec.offsetWidth,
        startH: sec.offsetHeight
    }
})

document.addEventListener('mousemove', function (e) {
    if (!secResize) return
    const { el, mode, startX, startY, startW, startH } = secResize
    if (mode === 'width' || mode === 'both') {
        el.style.width = Math.max(100, startW + e.clientX - startX) + 'px'
    }
    if (mode === 'height' || mode === 'both') {
        el.style.minHeight = Math.max(40, startH + e.clientY - startY) + 'px'
    }
})

document.addEventListener('mouseup', function () {
    if (secResize) {
        // Mark section as having custom width so layoutSections respects it
        if (secResize.mode === 'width' || secResize.mode === 'both') {
            secResize.el.dataset.customWidth = '1'
        }
        secResize = null
        layoutSections()
    }
})

/* ══════════════════════════════════════
   DIAGRAM COPY-PASTE
══════════════════════════════════════ */
let copiedDiagramHTML = null

function injectDiagramCopyButtons() {
    document.querySelectorAll('.diagram-box').forEach(box => {
        if (box.querySelector('.dia-copy')) return
        const svg = box.querySelector('svg')
        if (!svg) return
        const btn = document.createElement('button')
        btn.className = 'dia-copy'
        btn.title = 'Copy diagram'
        btn.textContent = '📋'
        btn.addEventListener('click', function (e) {
            e.stopPropagation()
            copiedDiagramHTML = svg.outerHTML
            btn.textContent = '✅'
            setTimeout(() => { btn.textContent = '📋' }, 1200)
        })
        box.appendChild(btn)
    })
}

/* Allow pasting copied diagram into any contenteditable section */
document.addEventListener('paste', function (e) {
    if (!copiedDiagramHTML) return
    const el = e.target.closest('.scont[contenteditable]')
    if (!el) return
    e.preventDefault()
    // Create a diagram-box wrapper with the SVG inside
    const wrapper = document.createElement('div')
    wrapper.className = 'diagram-box'
    wrapper.style.cssText = 'margin:8px 0;border-top:1px solid #eee;padding:8px;text-align:center;position:relative;min-height:60px'
    wrapper.innerHTML = copiedDiagramHTML
    // Insert at cursor or at end
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        range.insertNode(wrapper)
        range.collapse(false)
    } else {
        el.appendChild(wrapper)
    }
    // Re-inject toolbars on new diagram box
    injectShapeToolbars()
    injectDiagramCopyButtons()
    copiedDiagramHTML = null
})

/* ══════════════════════════════════════
   INIT ON LOAD
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    // Add drag handles, width toggle, and resize handles to all sections
    document.querySelectorAll('.section').forEach(sec => {
        if (!sec.querySelector('.sec-drag')) {
            const btn = document.createElement('button')
            btn.className = 'sec-drag'; btn.title = 'Drag to reorder'; btn.textContent = '⠿'
            sec.prepend(btn)
        }
        if (!sec.querySelector('.sec-width')) {
            const wb = document.createElement('button')
            wb.className = 'sec-width'
            wb.title = sec.classList.contains('sec-full') ? 'Half width' : 'Full width'
            wb.textContent = sec.classList.contains('sec-full') ? '↔' : '⇔'
            wb.setAttribute('onclick', 'toggleSectionWidth(this)')
            const drag = sec.querySelector('.sec-drag')
            if (drag) drag.after(wb)
            else sec.prepend(wb)
        }
        injectResizeHandles(sec)
        initSectionDrag(sec)
    })
    // Inject shape toolbars on all diagram boxes
    injectShapeToolbars()
    // Inject diagram copy buttons
    injectDiagramCopyButtons()

    // Compute waterfall layout
    layoutSections()

    // Prevent typing in diagram-box areas (SVG diagrams should NOT be editable via keyboard)
    document.querySelectorAll('.diagram-box').forEach(box => {
        box.addEventListener('keydown', function (e) {
            // Allow typing only inside .ms-label or .svg-edit-input
            if (e.target.closest('.ms-label') || e.target.closest('.svg-edit-input')) return
            // Block all other keyboard input in diagram areas
            if (!e.ctrlKey && !e.metaKey && e.key.length === 1) {
                e.preventDefault()
            }
        })
    })
})

