Vue.component('Card', {
    template: `
    <div class="card">
        <textarea v-model="card.content" placeholder="Введите заметку"></textarea>
        <ul>
            <li v-for="(item, index) in card.items" :key="index">
                <input type="checkbox" v-model="item.completed" @change="updateCompletion" />
                <span :class="{ completed: item.completed }">{{ item.text }}</span>
            </li>
        </ul>
        <button @click="addItem">Добавить пункт</button>
        <div v-if="card.completedDate">
            Завершено: {{ card.completedDate }}
        </div>
    </div>
    `,
    props: {
        card: Object,
    },
    methods: {
        addItem() {
            const newItem = { text: `Пункт ${this.card.items.length + 1}`, completed: false };
            this.card.items.push(newItem);
        },

        updateCompletion() {
            this.$emit('update-completion', this.card.id);
        },
    },
})

Vue.component('column', {
    template: `
    <div class="column">
        <div v-for="card in cards" :key="card.id">
          <Card :card="card" @move="handleMove(card.id)" @update-completion="handleUpdateCompletion(card.id)" />
        </div>
        <button v-if="cards.length < maxCards" @click="addCard">Добавить карточку</button>
    </div>
    `,

    props: {
        cards: Array,
        maxCards: Number,
        columnIndex: Number,
    },
    methods: {
        addCard() {
            this.$emit('add-card');
        },
        handleMove(cardId) {
            this.$emit('move-card', { cardId, fromColumnIndex: this.columnIndex });
        },
        handleUpdateCompletion(cardId) {
            this.$emit('update-completion', cardId);
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
                :maxCards="column.maxCards"
                :columnIndex="index"
                @add-card="addCard(index)"
                @move-card="moveCard"
                @update-completion="handleUpdateCompletion"
             />
        </div>
    `,
    data() {
        return {
            columns: [
                { cards: [], maxCards: 3 },
                { cards: [], maxCards: 5 },
                { cards: [], maxCards: Infinity },
            ],
        };
    },
    methods: {
        addCard(columnIndex) {
            const newCard = {
                id: Date.now(),
                content: '',
                items: [],
                completedDate: null,
            };
            this.columns[columnIndex].cards.push(newCard);
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
            if (card) {
                const completedCount = card.items.filter(item => item.completed).length;
                const totalCount = card.items.length;

                if (totalCount > 0) {
                    const completionPercentage = (completedCount / totalCount) * 100;

                    if (completionPercentage > 50 && this.columns[0].cards.includes(card)) {
                        this.moveCard({ cardId, fromColumnIndex: 0 });
                    } else if (completionPercentage === 100 && this.columns[1].cards.includes(card)) {
                        this.moveCard({ cardId, fromColumnIndex: 1 });
                        card.completedDate = new Date().toLocaleString();
                    }
                }
            }
        },
    },
})

let app = new Vue({
    el: '#app',
});