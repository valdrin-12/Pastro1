#!/bin/bash

# Script për të kontrolluar një kompani në databazë
# Përdorim: ./check-company.sh "Emri i Kompanisë" ose ./check-company.sh "email@example.com"

export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"

if [ -z "$1" ]; then
    echo "Përdorim: ./check-company.sh \"Emri i Kompanisë\" ose ./check-company.sh \"email@example.com\""
    echo ""
    echo "Shembuj:"
    echo "  ./check-company.sh \"DR\""
    echo "  ./check-company.sh \"dr@gmail.com\""
    exit 1
fi

SEARCH_TERM="$1"

node -e "
const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();

async function searchCompany(term) {
    try {
        // Kërko sipas emrit
        let companies = await p.company.findMany({
            where: {
                name: {
                    contains: term,
                    mode: 'insensitive'
                }
            },
            include: {
                user: {
                    select: {
                        email: true
                    }
                },
                companyCities: {
                    include: {
                        city: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                companyServices: {
                    include: {
                        service: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Nëse nuk gjeti sipas emrit, kërko sipas email
        if (companies.length === 0) {
            const user = await p.user.findUnique({
                where: {
                    email: term
                },
                include: {
                    company: {
                        include: {
                            companyCities: {
                                include: {
                                    city: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            },
                            companyServices: {
                                include: {
                                    service: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (user && user.company) {
                companies = [user.company];
            }
        }

        if (companies.length === 0) {
            console.log('❌ Kompania nuk u gjet në databazë.');
            console.log(\`Kërkuar: \"\${term}\"\`);
        } else {
            console.log(\`✅ U gjetën \${companies.length} kompani:\n\`);
            
            companies.forEach((c, index) => {
                console.log(\`\${index + 1}. Emri: \${c.name}\`);
                console.log(\`   ID: \${c.id}\`);
                console.log(\`   Email: \${c.user?.email || 'N/A'}\`);
                console.log(\`   Telefon: \${c.phone || 'N/A'}\`);
                console.log(\`   Status: \${c.status || 'NULL'}\`);
                console.log(\`   Aktiv: \${c.isActive ? 'Po' : 'Jo'}\`);
                console.log(\`   Përshkrim: \${c.description || 'N/A'}\`);
                console.log(\`   Krijuar: \${c.createdAt}\`);
                
                if (c.companyCities && c.companyCities.length > 0) {
                    const cities = c.companyCities.map(cc => cc.city.name).join(', ');
                    console.log(\`   Qytete: \${cities}\`);
                } else {
                    console.log(\`   Qytete: Asnjë\`);
                }
                
                if (c.companyServices && c.companyServices.length > 0) {
                    console.log(\`   Shërbime (\${c.companyServices.length}):\`);
                    c.companyServices.forEach(cs => {
                        console.log(\`      - \${cs.service.name}: €\${cs.price}\`);
                    });
                } else {
                    console.log(\`   Shërbime: Asnjë\`);
                }
                
                console.log('');
            });
        }
        
        await p.\$disconnect();
    } catch (error) {
        console.error('Gabim:', error.message);
        process.exit(1);
    }
}

searchCompany('$SEARCH_TERM');
"

