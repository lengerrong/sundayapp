import React, { useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { observer, useLocalObservable } from "mobx-react-lite"

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

const MovableItem = ({ item, index }) => {
    return (
        <Draggable draggableId={item.id} index={index}>
            {provided => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    {item.child}
                </div>
            )}
        </Draggable>
    )
}

const MovingList = React.memo(({ movableItems }) => {
    return movableItems.map((movableItem, index: number) => (
        <MovableItem item={movableItem} index={index} key={movableItem.id} />
    ))
})

const DragMoveDrop = observer(({ children }) => {
    const items = children.map((child, index) => {
        return {child, id: String(index)}
    })
    const dragMoveDrop = useLocalObservable(() => ({
        items: items,
        ready: false,
        setItems(items) {
            this.items = items
        },
        setReady(ready) {
            this.ready = ready;
        }
    }))
    useEffect(
        () => {
            dragMoveDrop.setItems(items)
            dragMoveDrop.setReady(true)
        },
        [children]
    )
    const onDragEnd = (result) => {
        if (!result.destination) {
            return
        }

        if (result.destination.index === result.source.index) {
            return
        }

        const items = reorder(
            dragMoveDrop.items,
            result.source.index,
            result.destination.index
        )

        dragMoveDrop.setItems(items)
    }
    if (dragMoveDrop.items.length < 1) {
        return null
    }
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
                {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {dragMoveDrop.ready && <MovingList movableItems={dragMoveDrop.items} />}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
})
 
export default DragMoveDrop