Vue.component('Card', {
    template: `
    <div class="card">
        <textarea v-model="card.content" placeholder="Введите заметку" :disabled="card.isDone"></textarea>
        <ul>
             <li v-for="(item, index) in card.items" :key="index">
                 <input type="checkbox" v-model="item.completed" @change="updateCompletion" :disabled="!card.isDone" />
                 <span :class="{ completed: item.completed }">{{ item.text }}</span>
             </li>
         </ul>
        <div v-if="card.completedDate">
            Завершено: {{ card.completedDate }}
        </div>
    </div>
    `,
    props: {
        card: Object,
    },
    methods: {
        updateCompletion() {
            this.$emit('update-completion', this.card.id);
        },

        markAsDone() {
            this.$emit('mark-as-done', this.card.id);
        },
    }
})

Vue.component('column', {
    template: `
    <div class="column">
        <div v-for="card in cards" :key="card.id">
          <Card :card="card" @move="handleMove(card.id)" @update-completion="handleUpdateCompletion(card.id)" @mark-as-done="handleMarkAsDone(card.id)" />
        </div>
    </div>
    `,

    props: {
        cards: Array,
        columnIndex: Number,
    },
    methods: {
        handleMove(cardId) {
            this.$emit('move-card', { cardId, fromColumnIndex: this.columnIndex });
        },
        handleUpdateCompletion(cardId) {
            this.$emit('update-completion', cardId);
        },
        handleMarkAsDone(cardId) {
            this.$emit('mark-as-done', cardId);
        },
    },
})

Vue.component('notepad', {
    template: `
        <div class="notepad">
            <column
                v-for="(column, index) in columns"
                :key="index"
                :cards="column.cards"
                :columnIndex="index"
                @move-card="moveCard"
                @update-completion="handleUpdateCompletion"
                @mark-as-done="handleMarkAsDone"
             />
            <div class="card-creator">
                <textarea v-model="newCardContent" placeholder="Введите текст для новой карточки"></textarea>
                <ul>
                    <li v-for="(item, index) in newCardItems" :key="index">
                        <input v-model="item.text" placeholder="Введите пункт" :disabled="isCardLocked" />
                        <button @click="removeItem(index)" :disabled="isCardLocked">Удалить</button>
                    </li>
                </ul>
                <button @click="addItem" :disabled="isCardLocked">Добавить пункт</button>
                <button @click="addCard">Добавить карточку</button>
            </div>
        </div>
    `,
    data() {
        return {
            columns: [
                { cards: [] },
                { cards: [] },
                { cards: [] },
            ],
            newCardContent: '',
            newCardItems: [],
            isCardLocked: false, // Блокировка редактирования после добавления карточки
        };
    },
    methods: {
        addItem() {
            this.newCardItems.push({ text: '', completed: false });
        },
        removeItem(index) {
            this.newCardItems.splice(index, 1);
        },
        addCard() {
            const newCard = {
                id: Date.now(),
                content: this.newCardContent,
                items: this.newCardItems.map(item => ({ ...item })), // Копируем пункты
                completedDate: null,
                isDone: true, // Блокируем карточку после добавления
            };
            this.columns[0].cards.push(newCard);
            this.resetCardCreator();
        },
        resetCardCreator() {
            this.newCardContent = '';
            this.newCardItems = [];
            this.isCardLocked = false; // Сброс блокировки (если нужно)
        },
        moveCard({ cardId, fromColumnIndex }) {
            const card = this.columns[fromColumnIndex].cards.find(c => c.id === cardId);
            if (card) {
                this.columns[fromColumnIndex].cards = this.columns[fromColumnIndex].cards.filter(c => c.id !== cardId);
                this.columns[fromColumnIndex + 1].cards.push(card);
            }
        },
        handleUpdateCompletion(cardId) {
            const card = this.columns.flatMap(col => col.cards).find(c => c.id === cardId);
            if (card && card.isDone) { // Проверяем, что карточка завершена
                const completedCount = card.items.filter(item => item.completed).length;
                const totalCount = card.items.length;

                if (totalCount > 0) {
                    const completionPercentage = (completedCount / totalCount) * 100;

                    if (completionPercentage >= 50 && this.columns[0].cards.includes(card)) {
                        this.moveCard({ cardId, fromColumnIndex: 0 });
                    } else if (completionPercentage === 100 && this.columns[1].cards.includes(card)) {
                        this.moveCard({ cardId, fromColumnIndex: 1 });
                        card.completedDate = new Date().toLocaleString();
                    }
                }
            }
        },
        handleMarkAsDone(cardId) {
            const card = this.columns.flatMap(col => col.cards).find(c => c.id === cardId);
            if (card) {
                card.isDone = true; // Помечаем карточку как завершенную
                this.handleUpdateCompletion(cardId); // Активируем проверку условий перемещения
            }
        },
    },
})

let app = new Vue({
    el: '#app',
});