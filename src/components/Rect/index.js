import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { getLength, getAngle, getCursor } from '../../utils'
import StyledRect from './StyledRect.Touch'

const zoomableMap = {
  'n': 't',
  's': 'b',
  'e': 'r',
  'w': 'l',
  'ne': 'tr',
  'nw': 'tl',
  'se': 'br',
  'sw': 'bl'
}

export default class Rect extends PureComponent {
  static propTypes = {
    styles: PropTypes.object,
    zoomable: PropTypes.string,
    rotatable: PropTypes.bool,
    onResizeStart: PropTypes.func,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onRotateStart: PropTypes.func,
    onRotate: PropTypes.func,
    onRotateEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    parentRotateAngle: PropTypes.number
  }

  setElementRef = ref => this.$element = ref

  // Drag
  startDrag = (e) => {
    e.preventDefault && e.preventDefault();
    e.stopImmediatePropagation && e.stopImmediatePropagation()
    var startX = this.isTouchEvent(e) ? e.touches[0].clientX: e.clientX ;
    var startY = this.isTouchEvent(e) ? e.touches[0].clientY: e.clientY ;
    this.props.onDragStart && this.props.onDragStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.preventDefault && e.preventDefault();
      e.stopImmediatePropagation && e.stopImmediatePropagation()
      const clientX = this.isTouchEvent(e) ? e.touches[0].clientX: e.clientX ;
      const clientY = this.isTouchEvent(e) ? e.touches[0].clientY: e.clientY ;
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      this.props.onDrag(deltaX, deltaY)
      startX = clientX
      startY = clientY
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove, {passive:false})
      document.removeEventListener('touchend', onUp, {passive:false})
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onDragEnd && this.props.onDragEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, {passive:false})
    document.addEventListener('touchend', onUp, {passive:false})
  }

  // Rotate
  startRotate = (e) => {
    //if (e.button !== 0) return
    const clientX = this.isTouchEvent(e) ? e.touches[0].clientX: e.clientX ;
    const clientY = this.isTouchEvent(e) ? e.touches[0].clientY: e.clientY ;

    const { styles: { transform: { rotateAngle: startAngle } } } = this.props
    const rect = this.$element.getBoundingClientRect()
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
    var startVector = {
      x: clientX - center.x,
      y: clientY - center.y
    }
    this.props.onRotateStart && this.props.onRotateStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopImmediatePropagation()
     const clientX = this.isTouchEvent(e) ? e.touches[0].clientX: e.clientX ;
     const clientY = this.isTouchEvent(e) ? e.touches[0].clientY: e.clientY ;
      const rotateVector = {
        x: clientX - center.x,
        y: clientY - center.y
      }
      const angle = getAngle(startVector, rotateVector)
      this.props.onRotate(angle, startAngle)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove, {passive:false})
      document.removeEventListener('touchend', onUp, {passive:false})
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onRotateEnd && this.props.onRotateEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, {passive:false})
    document.addEventListener('touchend', onUp, {passive:false})
  }

  isTouchEvent= (e) => typeof TouchEvent === 'function' && ((e instanceof TouchEvent) || e.nativeEvent instanceof TouchEvent)
  // Resize
  startResize = (e, cursor) => {
   // if (e.button !== 0) return
   e.preventDefault && e.preventDefault();
   e.stopImmediatePropagation && e.stopImmediatePropagation()
    document.body.style.cursor = cursor
    const { styles: { position: { centerX, centerY }, size: { width, height }, transform: { rotateAngle } } } = this.props
    const startX = this.isTouchEvent(e) ? e.touches[0].clientX: e.clientX ;
    const startY = this.isTouchEvent(e) ? e.touches[0].clientY: e.clientY ;
    const rect = { width, height, centerX, centerY, rotateAngle }
    const type = e.target.getAttribute('class').split(' ')[0]
    this.props.onResizeStart && this.props.onResizeStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.preventDefault && e.preventDefault();
      e.stopImmediatePropagation && e.stopImmediatePropagation()
      const clientX = this.isTouchEvent(e) ? e.touches[0].clientX: e.clientX ;
      const clientY = this.isTouchEvent(e) ? e.touches[0].clientY: e.clientY ;
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const alpha = Math.atan2(deltaY, deltaX)
      const deltaL = getLength(deltaX, deltaY)
      const isShiftKey = e.shiftKey
      this.props.onResize(deltaL, alpha, rect, type, isShiftKey)
    }

    
    const onUp = () => {
      document.body.style.cursor = 'auto'
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove, {passive:false})
      document.removeEventListener('touchend', onUp, {passive:false})

      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onResizeEnd && this.props.onResizeEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, {passive:false})
    document.addEventListener('touchend', onUp, {passive:false})
  }

  render () {
    const { styles: { position: { centerX, centerY }, size: { width, height }, transform: { rotateAngle } }, zoomable, rotatable, parentRotateAngle } = this.props
    const style = { width: Math.abs(width), height: Math.abs(height), transform: `rotate(${rotateAngle}deg)`, left: centerX - Math.abs(width) / 2, top: centerY - Math.abs(height) / 2 }
    const direction = zoomable.split(',').map(d => d.trim()).filter(d => d)


    return (
      <StyledRect
        innerRef={this.setElementRef}
        onMouseDown={this.startDrag}
        onTouchStart={this.startDrag}
        className="rect single-resizer"
        style={style}
      >
        {rotatable && <div className="rotate" onMouseDown={this.startRotate} onTouchStart={this.startRotate}><i></i></div>}
        {direction.map(d => {
          const cursor = `${getCursor(rotateAngle + parentRotateAngle, d)}-resize`
          return (
            <div key={d} style={{ cursor }} className={`${zoomableMap[d]} resizable-handler`} onMouseDown={(e) => this.startResize(e, cursor)} onTouchStart={(e) => this.startResize(e, cursor)}></div>
          )
        })}
        {direction.map(d => {
          return (
            <div key={d} className={`${zoomableMap[d]} square`} />
          )
        })}
      </StyledRect>
    )
  }
}
